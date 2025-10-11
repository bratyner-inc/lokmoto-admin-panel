-- Seed data for testing proposal → contract workflow
-- This seed creates test proposals using EXISTING rental company, customer, and motorcycle IDs
-- Make sure to update the IDs below with actual values from your database

-- IMPORTANT: Update these IDs with real values from your database before running!
-- You can get these IDs by running:
-- SELECT id FROM rental_companies LIMIT 1;
-- SELECT id FROM customers LIMIT 1;
-- SELECT id FROM motorcycles WHERE is_available = true LIMIT 1;

DO $$
DECLARE
  v_rental_company_id UUID;
  v_customer_id UUID;
  v_motorcycle_id UUID;
  v_proposal_id_1 UUID := 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d';
  v_proposal_id_2 UUID := 'b2c3d4e5-f6a7-5b6c-9d8e-0f9g8h7i6j5k';
BEGIN
  -- Try to use the specified IDs, fallback to any existing records
  SELECT id INTO v_rental_company_id 
  FROM public.rental_companies 
  WHERE id = 'fefe9420-3aa8-45b5-bc88-25a21b41557a'::UUID
  LIMIT 1;
  
  -- If not found, use any rental company
  IF v_rental_company_id IS NULL THEN
    SELECT id INTO v_rental_company_id 
    FROM public.rental_companies 
    LIMIT 1;
  END IF;
  
  SELECT id INTO v_customer_id 
  FROM public.customers 
  WHERE id = '5ef5ddd1-b946-4648-8015-7abbefea1a29'::UUID
  LIMIT 1;
  
  -- If not found, use any customer
  IF v_customer_id IS NULL THEN
    SELECT id INTO v_customer_id 
    FROM public.customers 
    LIMIT 1;
  END IF;
  
  SELECT id INTO v_motorcycle_id 
  FROM public.motorcycles 
  WHERE id = 'e48e0cb3-b668-43da-828d-6aa9a9e44b18'::UUID
  AND rental_company_id = v_rental_company_id
  LIMIT 1;
  
  -- If not found, use any motorcycle from the rental company
  IF v_motorcycle_id IS NULL THEN
    SELECT id INTO v_motorcycle_id 
    FROM public.motorcycles 
    WHERE rental_company_id = v_rental_company_id
    AND is_available = true
    LIMIT 1;
  END IF;
  
  -- Check if we have all required data
  IF v_rental_company_id IS NULL THEN
    RAISE EXCEPTION 'No rental company found. Please create a rental company first.';
  END IF;
  
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'No customer found. Please create a customer first.';
  END IF;
  
  IF v_motorcycle_id IS NULL THEN
    RAISE EXCEPTION 'No motorcycle found. Please create a motorcycle first.';
  END IF;
  
  RAISE NOTICE 'Using Rental Company: %', v_rental_company_id;
  RAISE NOTICE 'Using Customer: %', v_customer_id;
  RAISE NOTICE 'Using Motorcycle: %', v_motorcycle_id;
  
  -- Delete existing test proposals if they exist
  DELETE FROM public.proposals WHERE id IN (v_proposal_id_1, v_proposal_id_2);
  
  -- Proposal 1: Accepted and ready for contract creation
  -- This proposal has a monthly value and is accepted, so it can be used to create a contract
  INSERT INTO public.proposals (
    id,
    customer_id,
    motorcycle_id,
    rental_company_id,
    status,
    start_date,
    end_date,
    monthly_value,
    proposed_daily_rate,
    notes,
    created_at,
    updated_at
  ) VALUES (
    v_proposal_id_1,
    v_customer_id,
    v_motorcycle_id,
    v_rental_company_id,
    'accepted', -- Status: ready to create contract
    CURRENT_DATE + INTERVAL '3 days', -- Start date: 3 days from now
    CURRENT_DATE + INTERVAL '6 months', -- End date: 6 months contract
    899.90, -- Monthly value: R$ 899,90/mês
    30.00, -- Daily rate alternative: R$ 30,00/dia
    'Proposta aceita pelo cliente. Pronto para gerar contrato de assinatura mensal.',
    NOW() - INTERVAL '2 days', -- Created 2 days ago
    NOW() - INTERVAL '1 day' -- Updated 1 day ago (when accepted)
  );
  
  -- Proposal 2: Pending customer response
  -- This proposal is still pending, showing the workflow before acceptance
  INSERT INTO public.proposals (
    id,
    customer_id,
    motorcycle_id,
    rental_company_id,
    status,
    start_date,
    end_date,
    monthly_value,
    proposed_daily_rate,
    notes,
    created_at,
    updated_at
  ) VALUES (
    v_proposal_id_2,
    v_customer_id,
    v_motorcycle_id,
    v_rental_company_id,
    'pending', -- Status: waiting for customer response
    CURRENT_DATE + INTERVAL '7 days', -- Start date: 1 week from now
    NULL, -- End date: open-ended contract proposal
    749.90, -- Monthly value: R$ 749,90/mês (promotional)
    25.00, -- Daily rate alternative: R$ 25,00/dia
    'Proposta promocional para contrato sem prazo determinado. Aguardando resposta do cliente.',
    NOW() - INTERVAL '1 day', -- Created 1 day ago
    NOW() - INTERVAL '1 day' -- Not updated yet
  );
  
  RAISE NOTICE 'Successfully created 2 test proposals';
  RAISE NOTICE 'Proposal 1 (ACCEPTED): % - Ready to create contract', v_proposal_id_1;
  RAISE NOTICE 'Proposal 2 (PENDING): % - Waiting for customer response', v_proposal_id_2;
END $$;
