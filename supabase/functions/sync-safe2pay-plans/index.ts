import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Safe2Pay Plan Response Interface
interface Safe2PayPlan {
  idPlan: number;
  name: string;
  subscriptionLimit: number;
  quantitySubscription: number;
  amount: number;
  frequence: string;
}

interface Safe2PayResponse {
  success: boolean;
  data: {
    objects: Safe2PayPlan[];
    totalItems: number;
  };
}

/**
 * Fetch plans from Safe2Pay API
 */
async function fetchSafe2PayPlans(apiKey: string): Promise<Safe2PayPlan[]> {
  console.log("Fetching plans from Safe2Pay API...");
  
  const response = await fetch(
    "https://services.safe2pay.com.br/recurrence/v1/plans/",
    {
      headers: {
        "X-API-KEY": apiKey,
        accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Safe2Pay API error: ${response.status} - ${errorText}`
    );
  }

  const data: Safe2PayResponse = await response.json();
  
  if (!data.success) {
    throw new Error("Safe2Pay API returned success: false");
  }

  console.log(`Fetched ${data.data.objects.length} plans from Safe2Pay`);
  
  // Filter only monthly plans (Mensal)
  const monthlyPlans = data.data.objects.filter(
    (plan) => plan.frequence === "Mensal"
  );
  
  console.log(`Filtered to ${monthlyPlans.length} monthly plans`);
  
  return monthlyPlans;
}

/**
 * Sync plans with database using merge strategy
 */
async function syncPlans(supabase: any, safe2payPlans: Safe2PayPlan[]) {
  console.log("Starting merge operation...");

  // 1. Fetch existing plans
  const { data: existingPlans, error: fetchError } = await supabase
    .from("safe2pay_plans")
    .select("plan_id, id, name, amount");

  if (fetchError) {
    throw new Error(`Failed to fetch existing plans: ${fetchError.message}`);
  }

  console.log(`Found ${existingPlans?.length || 0} existing plans in database`);

  // 2. Create lookup maps
  const existingPlanMap = new Map(
    existingPlans?.map((p: any) => [p.plan_id, p]) || []
  );
  const currentPlanIds = new Set(
    safe2payPlans.map((p) => String(p.idPlan))
  );

  // 3. Identify operations
  const toInsert: Safe2PayPlan[] = [];
  const toUpdate: Safe2PayPlan[] = [];

  for (const plan of safe2payPlans) {
    const planId = String(plan.idPlan);
    if (existingPlanMap.has(planId)) {
      toUpdate.push(plan);
    } else {
      toInsert.push(plan);
    }
  }

  const toDeprecate = Array.from(existingPlanMap.keys()).filter(
    (id) => !currentPlanIds.has(id)
  );

  console.log(
    `Operations: ${toInsert.length} to insert, ${toUpdate.length} to update, ${toDeprecate.length} to deprecate`
  );

  // 4. Execute INSERT operations
  let insertedCount = 0;
  if (toInsert.length > 0) {
    const insertData = toInsert.map((plan) => ({
      plan_id: String(plan.idPlan),
      name: plan.name,
      amount: plan.amount,
      interval_type: "monthly",
      status: "active",
      metadata: {
        subscriptionLimit: plan.subscriptionLimit,
        quantitySubscription: plan.quantitySubscription,
        frequence: plan.frequence,
      },
    }));

    const { error: insertError } = await supabase
      .from("safe2pay_plans")
      .insert(insertData);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to insert plans: ${insertError.message}`);
    }

    insertedCount = toInsert.length;
    console.log(`Inserted ${insertedCount} new plans`);
  }

  // 5. Execute UPDATE operations
  let updatedCount = 0;
  for (const plan of toUpdate) {
    const { error: updateError } = await supabase
      .from("safe2pay_plans")
      .update({
        name: plan.name,
        amount: plan.amount,
        metadata: {
          subscriptionLimit: plan.subscriptionLimit,
          quantitySubscription: plan.quantitySubscription,
          frequence: plan.frequence,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("plan_id", String(plan.idPlan));

    if (updateError) {
      console.error(`Update error for plan ${plan.idPlan}:`, updateError);
      // Continue with other updates
    } else {
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} plans`);

  // 6. Execute DEPRECATE operations
  let deprecatedCount = 0;
  if (toDeprecate.length > 0) {
    const { error: deprecateError } = await supabase
      .from("safe2pay_plans")
      .update({
        status: "deprecated",
        updated_at: new Date().toISOString(),
      })
      .in("plan_id", toDeprecate);

    if (deprecateError) {
      console.error("Deprecate error:", deprecateError);
      throw new Error(`Failed to deprecate plans: ${deprecateError.message}`);
    }

    deprecatedCount = toDeprecate.length;
    console.log(`Deprecated ${deprecatedCount} plans`);
  }

  return {
    inserted: insertedCount,
    updated: updatedCount,
    deprecated: deprecatedCount,
  };
}

/**
 * Validate that user is a platform admin
 */
async function validatePlatformAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const SAFE2PAY_API_KEY = Deno.env.get("SAFE2PAY_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SAFE2PAY_API_KEY) {
      throw new Error("SAFE2PAY_API_KEY environment variable is not set");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables are not set");
    }

    // Create Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Validate authorization (only for non-cron invocations)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      // Extract JWT token
      const token = authHeader.replace("Bearer ", "");
      
      // Get user from JWT
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Unauthorized: Invalid token",
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate that user is platform admin
      const isAdmin = await validatePlatformAdmin(supabaseClient, user.id);
      
      if (!isAdmin) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Unauthorized: Only platform admins can sync plans",
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`Sync requested by platform admin: ${user.id}`);
    } else {
      console.log("Sync invoked by cron job or internal service");
    }

    // Fetch plans from Safe2Pay
    const safe2payPlans = await fetchSafe2PayPlans(SAFE2PAY_API_KEY);

    // Sync plans with database
    const result = await syncPlans(supabaseClient, safe2payPlans);

    console.log("Sync completed successfully:", result);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in sync-safe2pay-plans:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


