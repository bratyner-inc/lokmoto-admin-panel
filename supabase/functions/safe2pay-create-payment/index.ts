import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePaymentRequest {
  contractId: string;
  amount: number;
  paymentMethod: "credit_card" | "boleto" | "pix";
  cardToken?: string;
  customerData: {
    name: string;
    email: string;
    cpfCnpj: string;
  };
  rentalCompanyData: {
    cnpj: string;
    tradingName: string;
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

    const body: CreatePaymentRequest = await req.json();
    const { contractId, amount, paymentMethod, cardToken, customerData, rentalCompanyData } = body;

    console.log("Creating Safe2Pay payment for contract:", contractId);

    // Get contract details
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .single();

    if (contractError || !contract) {
      throw new Error("Contract not found");
    }

    // Create payment payload for Safe2Pay
    const paymentPayload = {
      IsSandbox: true,
      Application: "Lokmoto",
      Vendor: {
        Name: "Lokmoto Platform",
        Identity: "00000000000191", // Platform CNPJ
      },
      Customer: {
        Name: customerData.name,
        Email: customerData.email,
        Identity: customerData.cpfCnpj,
      },
      PaymentMethod: paymentMethod === "credit_card" ? "CreditCard" : paymentMethod === "pix" ? "Pix" : "BankSlip",
      Amount: amount,
      Reference: contractId,
      ...(paymentMethod === "credit_card" && cardToken && {
        CreditCard: {
          Token: cardToken,
        },
      }),
    };

    const response = await fetch(
      "https://services.safe2pay.com.br/v2/Payment",
      {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Safe2Pay API error:", errorText);
      throw new Error(`Safe2Pay API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log("Payment created successfully:", data);

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        payer_id: user.id,
        receiver_id: contract.rental_company_id,
        amount: amount,
        currency: "BRL",
        payment_method: paymentMethod,
        status: "pending",
        external_reference: data.IdTransaction,
        contract_id: contractId,
        transaction_type: "rental_payment",
        customer_data: {
          cpf_cnpj: customerData.cpfCnpj,
          id: user.id,
          name: customerData.name,
          rental_company_cnpj: rentalCompanyData.cnpj,
          rental_company_name: rentalCompanyData.tradingName,
        },
        rental_company_data: {
          cnpj: rentalCompanyData.cnpj,
          id: contract.rental_company_id,
          trading_name: rentalCompanyData.tradingName,
        },
      });

    if (transactionError) {
      console.error("Error creating transaction record:", transactionError);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating Safe2Pay payment:", error);
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
