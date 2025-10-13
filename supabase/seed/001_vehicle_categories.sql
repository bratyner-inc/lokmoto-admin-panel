-- Seed initial vehicle categories for motorcycles

INSERT INTO vehicle_categories (id, name, description) VALUES
    (gen_random_uuid(), 'Street', 'Motos urbanas para uso diário e deslocamento na cidade'),
    (gen_random_uuid(), 'Sport', 'Motos esportivas de alta performance'),
    (gen_random_uuid(), 'Cruiser', 'Motos estilo custom/cruiser para passeios'),
    (gen_random_uuid(), 'Touring', 'Motos de turismo para viagens longas'),
    (gen_random_uuid(), 'Adventure', 'Motos de aventura para on-road e off-road'),
    (gen_random_uuid(), 'Scooter', 'Scooters automáticas para uso urbano'),
    (gen_random_uuid(), 'Naked', 'Motos naked sem carenagem'),
    (gen_random_uuid(), 'Trail', 'Motos trail para uso misto')
ON CONFLICT (name) DO NOTHING;

