-- Enable required PostgreSQL extensions

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fuzzy text search (for searching motorcycles, customers, etc.)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- PostGIS for location data (for tickets in future)
CREATE EXTENSION IF NOT EXISTS "postgis";

