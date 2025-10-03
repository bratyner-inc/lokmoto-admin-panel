import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Safe2PayWebhook {
  IdTransaction?: string;
  IdSubscription?: string;
  Status: string;
  EventType: string;
  Data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const webhookData: Safe2PayWebhook = await req.json();
    
    console.log("Received Safe2Pay webhook:", JSON.stringify(webhookData, null, 2));

    const { IdTransaction, IdSubscription, Status, EventType } = webhookData;

    // Map Safe2Pay status to our transaction status
    const statusMap: Record<string, string> = {
      "Approved": "paid",
      "Cancelled": "failed",
      "Denied": "failed",
      "Pending": "pending",
      "Refunded": "refunded",
    };

    const transactionStatus = statusMap[Status] || "pending";

    // Update transaction status if IdTransaction exists
    if (IdTransaction) {
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          status: transactionStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("external_reference", IdTransaction);

      if (updateError) {
        console.error("Error updating transaction:", updateError);
      } else {
        console.log(`Updated transaction ${IdTransaction} to status: ${transactionStatus}`);
      }
    }

    // Update subscription status if IdSubscription exists
    if (IdSubscription) {
      let subscriptionStatus = "active";
      if (Status === "Cancelled") {
        subscriptionStatus = "canceled";
      } else if (Status === "Expired") {
        subscriptionStatus = "expired";
      }

      const { error: updateError } = await supabase
        .from("rental_companies")
        .update({
          subscription_status: subscriptionStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("safe2pay_subscription_id", IdSubscription);

      if (updateError) {
        console.error("Error updating rental company subscription:", updateError);
      } else {
        console.log(`Updated subscription ${IdSubscription} to status: ${subscriptionStatus}`);
      }
    }

    // Handle specific event types
    switch (EventType) {
      case "PaymentApproved":
        console.log("Payment approved event received");
        // TODO: Send notification to user
        break;
      case "PaymentDenied":
        console.log("Payment denied event received");
        // TODO: Send notification to user
        break;
      case "SubscriptionCancelled":
        console.log("Subscription cancelled event received");
        // TODO: Send notification to rental company
        break;
      default:
        console.log(`Unhandled event type: ${EventType}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Webhook processed successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing Safe2Pay webhook:", error);
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
