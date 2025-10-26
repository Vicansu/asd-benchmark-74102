-- Fix search_path for handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix search_path for generate_test_code function
CREATE OR REPLACE FUNCTION public.generate_test_code(subject_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix TEXT;
  random_chars TEXT;
  test_code TEXT;
BEGIN
  -- Get subject prefix
  prefix := CASE subject_param
    WHEN 'english' THEN 'E'
    WHEN 'science' THEN 'S'
    WHEN 'mathematics' THEN 'M'
    ELSE 'T'
  END;
  
  -- Generate 5 random uppercase letters
  random_chars := upper(substring(md5(random()::text) from 1 for 5));
  
  -- Combine prefix and random chars
  test_code := prefix || random_chars;
  
  RETURN test_code;
END;
$$;