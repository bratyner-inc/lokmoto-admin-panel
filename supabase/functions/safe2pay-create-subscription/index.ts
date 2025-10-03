import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateSubscriptionRequest {
  planId: number;
  customerId: string;
  paymentMethod: "credit_card" | "boleto";
  cardToken?: string; // For credit card payments
  customerData: {
    name: string;
    email: string;
    cpfCnpj: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("SAFE2PAY_API_KEY_SANDBOX");
    
    if (!apiKey) {
      throw new Error("SAFE2PAY_API_KEY_SANDBOX not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const body: CreateSubscriptionRequest = await req.json();
    const { planId, customerId, paymentMethod, cardToken, customerData } = body;

    console.log("Creating Safe2Pay subscription for user:", user.id);

    // Create subscription payload for Safe2Pay
    const subscriptionPayload = {
      PlanId: planId,
      Customer: {
        Name: customerData.name,
        Email: customerData.email,
        Identity: customerData.cpfCnpj,
      },
      PaymentMethod: paymentMethod === "credit_card" ? "CreditCard" : "BankSlip",
      ...(paymentMethod === "credit_card" && cardToken && {
        CreditCard: {
          Token: cardToken,
        },
      }),
    };

    const response = await fetch(
      "https://services.safe2pay.com.br/recurrence/v1/subscription",
      {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify(subscriptionPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Safe2Pay API error:", errorText);
      throw new Error(`Safe2Pay API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log("Subscription created successfully:", data);

    // Update rental_companies table with subscription info
    const { error: updateError } = await supabase
      .from("rental_companies")
      .update({
        safe2pay_subscription_id: data.Id,
        subscription_status: "active",
        subscription_plan: planId.toString(),
        subscription_expiration: new Date(data.NextCycle).toISOString(),
      })
      .eq("id", customerId);

    if (updateError) {
      console.error("Error updating rental company:", updateError);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating Safe2Pay subscription:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
