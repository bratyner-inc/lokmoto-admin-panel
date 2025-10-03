import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Safe2PayPlan {
  idPlan: number;
  name: string;
  subscriptionLimit: number;
  quantitySubscription: number;
  amount: number;
  frequence: string;
}

interface Safe2PayPlansResponse {
  success: boolean;
  data: {
    objects: Safe2PayPlan[];
    totalItems: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("SAFE2PAY_API_KEY_SANDBOX");
    
    if (!apiKey) {
      throw new Error("SAFE2PAY_API_KEY_SANDBOX not configured");
    }

    console.log("Fetching Safe2Pay plans...");

    const response = await fetch(
      "https://services.safe2pay.com.br/recurrence/v1/plans/",
      {
        method: "GET",
        headers: {
          "X-API-KEY": apiKey,
          "accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Safe2Pay API error:", errorText);
      throw new Error(`Safe2Pay API returned ${response.status}: ${errorText}`);
    }

    const data: Safe2PayPlansResponse = await response.json();
    
    console.log(`Successfully fetched ${data.data.totalItems} plans`);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching Safe2Pay plans:", error);
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
