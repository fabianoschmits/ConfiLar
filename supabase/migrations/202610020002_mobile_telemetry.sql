BEGIN;
CREATE TABLE IF NOT EXISTS public.mobile_telemetry (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (name IN ('LCP','INP','CLS','ERROR','REJECTION','REACT_ERROR')),
  value double precision NOT NULL CHECK (value >= 0 AND value <= 3600000),
  route text NOT NULL CHECK (route IN ('/home','/feed','/classificados','/buscar','/usuarios','/auth','/mensagens','/perfil','/perfil/:id','/confipoints/dashboard','/confipoints/loja','other')),
  mobile boolean NOT NULL
);
CREATE INDEX IF NOT EXISTS mobile_telemetry_created_idx ON public.mobile_telemetry(created_at);
ALTER TABLE public.mobile_telemetry ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mobile_telemetry FROM anon, authenticated;
GRANT ALL ON public.mobile_telemetry TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.mobile_telemetry_id_seq TO service_role;
COMMIT;
