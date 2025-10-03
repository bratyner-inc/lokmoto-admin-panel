import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

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

// Verify Safe2Pay webhook signature
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payload)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook signature for security
    const webhookSecret = Deno.env.get('SAFE2PAY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('SAFE2PAY_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const signature = req.headers.get('X-Safe2Pay-Signature');
    const rawBody = await req.text();
    
    if (!signature) {
      console.error('Missing webhook signature');
      return new Response(
        JSON.stringify({ error: 'Missing signature', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const webhookData: Safe2PayWebhook = JSON.parse(rawBody);
    
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
