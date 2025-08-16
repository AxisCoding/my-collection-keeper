-- Allow null values for rating field to support "Not Rated" option
ALTER TABLE public.items ALTER COLUMN rating DROP NOT NULL;