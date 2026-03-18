ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS contact_type character varying(50);

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS contact_value character varying(255);
