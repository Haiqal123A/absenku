CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('Izin', 'Sakit')),
    request_date DATE NOT NULL,
    reason TEXT NOT NULL,
    attachment_path TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Diterima', 'Ditolak')),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_user_date
  ON public.leave_requests(user_id, request_date DESC);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
