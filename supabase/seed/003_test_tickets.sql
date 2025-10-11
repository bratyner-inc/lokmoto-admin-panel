-- Seed data for tickets and attachments
-- Creates example tickets for testing the system

DO $$
DECLARE
    _rental_company_id UUID;
    _customer_id UUID;
    _contract_id UUID;
    _ticket1_id UUID;
    _ticket2_id UUID;
    _ticket3_id UUID;
BEGIN
    RAISE NOTICE '🎫 Starting tickets seed...';
    
    -- Find or use existing rental company
    SELECT id INTO _rental_company_id 
    FROM public.rental_companies 
    WHERE id = 'fefe9420-3aa8-45b5-bc88-25a21b41557a';
    
    IF _rental_company_id IS NULL THEN
        SELECT id INTO _rental_company_id 
        FROM public.rental_companies 
        LIMIT 1;
    END IF;
    
    IF _rental_company_id IS NULL THEN
        RAISE EXCEPTION 'No rental companies found. Please create one first.';
    END IF;
    
    RAISE NOTICE '✓ Using rental company: %', _rental_company_id;
    
    -- Find a customer
    SELECT id INTO _customer_id 
    FROM public.customers 
    LIMIT 1;
    
    IF _customer_id IS NULL THEN
        RAISE EXCEPTION 'No customers found. Please create one first.';
    END IF;
    
    RAISE NOTICE '✓ Using customer: %', _customer_id;
    
    -- Find an active contract
    SELECT id INTO _contract_id 
    FROM public.contracts 
    WHERE rental_company_id = _rental_company_id
    AND customer_id = _customer_id
    AND status = 'active'
    LIMIT 1;
    
    IF _contract_id IS NULL THEN
        -- Try to find any contract
        SELECT id INTO _contract_id 
        FROM public.contracts 
        WHERE rental_company_id = _rental_company_id
        LIMIT 1;
    END IF;
    
    IF _contract_id IS NULL THEN
        RAISE EXCEPTION 'No contracts found. Please create one first.';
    END IF;
    
    RAISE NOTICE '✓ Using contract: %', _contract_id;
    
    -- ============================================================================
    -- Create Ticket 1: Defect Report (Open)
    -- ============================================================================
    
    INSERT INTO public.tickets (
        id,
        contract_id,
        customer_id,
        rental_company_id,
        ticket_type,
        status,
        priority,
        title,
        description
    ) VALUES (
        gen_random_uuid(),
        _contract_id,
        _customer_id,
        _rental_company_id,
        'defect',
        'open',
        'high',
        'Problema no freio dianteiro',
        'Percebi que o freio dianteiro está fazendo um ruído estranho e a frenagem não está tão eficiente quanto antes. Isso começou há 2 dias. Gostaria de solicitar uma revisão urgente, pois uso a moto diariamente para trabalhar.'
    )
    RETURNING id INTO _ticket1_id;
    
    RAISE NOTICE '✓ Created ticket 1 (Defect - Open): %', _ticket1_id;
    
    -- Add attachments to ticket 1 (2 photos)
    INSERT INTO public.ticket_attachments (
        ticket_id,
        file_type,
        file_name,
        file_url,
        file_size,
        mime_type,
        uploaded_by
    ) VALUES 
    (
        _ticket1_id,
        'photo',
        'freio_dianteiro_1.jpg',
        'ticket-attachments/' || _ticket1_id || '/freio_dianteiro_1.jpg',
        245678,
        'image/jpeg',
        _customer_id
    ),
    (
        _ticket1_id,
        'photo',
        'freio_dianteiro_2.jpg',
        'ticket-attachments/' || _ticket1_id || '/freio_dianteiro_2.jpg',
        198432,
        'image/jpeg',
        _customer_id
    );
    
    RAISE NOTICE '✓ Added 2 photo attachments to ticket 1';
    
    -- ============================================================================
    -- Create Ticket 2: Accident Report (In Progress)
    -- ============================================================================
    
    INSERT INTO public.tickets (
        id,
        contract_id,
        customer_id,
        rental_company_id,
        ticket_type,
        status,
        priority,
        title,
        description
    ) VALUES (
        gen_random_uuid(),
        _contract_id,
        _customer_id,
        _rental_company_id,
        'accident',
        'in_progress',
        'urgent',
        'Pequeno acidente - arranhão no tanque',
        'Bom dia! Infelizmente tive um pequeno acidente ao estacionar. A moto tombou e ficou com um arranhão no tanque. Ninguém se machucou e a moto está funcionando normalmente. Estou enviando fotos do dano e o boletim de ocorrência.'
    )
    RETURNING id INTO _ticket2_id;
    
    RAISE NOTICE '✓ Created ticket 2 (Accident - In Progress): %', _ticket2_id;
    
    -- Add attachments to ticket 2 (1 document + 3 photos - máximo)
    INSERT INTO public.ticket_attachments (
        ticket_id,
        file_type,
        file_name,
        file_url,
        file_size,
        mime_type,
        uploaded_by
    ) VALUES 
    (
        _ticket2_id,
        'document',
        'boletim_ocorrencia.pdf',
        'ticket-attachments/' || _ticket2_id || '/boletim_ocorrencia.pdf',
        567890,
        'application/pdf',
        _customer_id
    ),
    (
        _ticket2_id,
        'photo',
        'dano_tanque_1.jpg',
        'ticket-attachments/' || _ticket2_id || '/dano_tanque_1.jpg',
        312456,
        'image/jpeg',
        _customer_id
    ),
    (
        _ticket2_id,
        'photo',
        'dano_tanque_2.jpg',
        'ticket-attachments/' || _ticket2_id || '/dano_tanque_2.jpg',
        298765,
        'image/jpeg',
        _customer_id
    ),
    (
        _ticket2_id,
        'photo',
        'dano_tanque_3.jpg',
        'ticket-attachments/' || _ticket2_id || '/dano_tanque_3.jpg',
        334567,
        'image/jpeg',
        _customer_id
    );
    
    RAISE NOTICE '✓ Added 1 document + 3 photos to ticket 2';
    
    -- ============================================================================
    -- Create Ticket 3: Maintenance Request (Closed)
    -- ============================================================================
    
    INSERT INTO public.tickets (
        id,
        contract_id,
        customer_id,
        rental_company_id,
        ticket_type,
        status,
        priority,
        title,
        description,
        resolution,
        resolved_at
    ) VALUES (
        gen_random_uuid(),
        _contract_id,
        _customer_id,
        _rental_company_id,
        'other',
        'closed',
        'low',
        'Solicitação de revisão periódica',
        'Gostaria de agendar a revisão dos 5.000 km. A moto está com 4.950 km no hodômetro. Qual seria a melhor data disponível?',
        'Revisão agendada para 15/01/2025 às 14h00. Cliente confirmou presença. Revisão realizada com sucesso, todos os itens verificados e aprovados.',
        NOW() - INTERVAL '3 days'
    )
    RETURNING id INTO _ticket3_id;
    
    RAISE NOTICE '✓ Created ticket 3 (Other - Closed): %', _ticket3_id;
    
    -- Add attachment to ticket 3 (1 photo showing odometer)
    INSERT INTO public.ticket_attachments (
        ticket_id,
        file_type,
        file_name,
        file_url,
        file_size,
        mime_type,
        uploaded_by
    ) VALUES 
    (
        _ticket3_id,
        'photo',
        'hodometro.jpg',
        'ticket-attachments/' || _ticket3_id || '/hodometro.jpg',
        156789,
        'image/jpeg',
        _customer_id
    );
    
    RAISE NOTICE '✓ Added 1 photo to ticket 3';
    
    -- ============================================================================
    -- Create Ticket 4: Simple defect (Open, Low Priority)
    -- ============================================================================
    
    INSERT INTO public.tickets (
        contract_id,
        customer_id,
        rental_company_id,
        ticket_type,
        status,
        priority,
        title,
        description
    ) VALUES (
        _contract_id,
        _customer_id,
        _rental_company_id,
        'defect',
        'open',
        'low',
        'Luz do painel piscando',
        'A luz de aviso do painel fica piscando ocasionalmente. Não parece afetar o funcionamento, mas gostaria de verificar se é normal.'
    );
    
    RAISE NOTICE '✓ Created ticket 4 (Defect - Open - Low Priority) without attachments';
    
    -- Summary
    RAISE NOTICE '=============================================================';
    RAISE NOTICE '✅ Tickets seed completed successfully!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   - Created 4 tickets';
    RAISE NOTICE '   - Ticket 1: Defect (Open, High) - 2 photos';
    RAISE NOTICE '   - Ticket 2: Accident (In Progress, Urgent) - 1 doc + 3 photos';
    RAISE NOTICE '   - Ticket 3: Other (Closed, Low) - 1 photo';
    RAISE NOTICE '   - Ticket 4: Defect (Open, Low) - no attachments';
    RAISE NOTICE '   - Total attachments: 7';
    RAISE NOTICE '=============================================================';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error in tickets seed: %', SQLERRM;
        RAISE;
END $$;

