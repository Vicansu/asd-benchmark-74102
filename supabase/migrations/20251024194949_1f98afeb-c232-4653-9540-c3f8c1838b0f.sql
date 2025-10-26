-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  student_id TEXT,
  grade TEXT,
  class TEXT,
  gender TEXT,
  age INTEGER,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create tests table
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_code TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL CHECK (subject IN ('english', 'science', 'mathematics')),
  title TEXT NOT NULL,
  pdf_url TEXT,
  total_questions INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 60,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Create test_results table
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score DECIMAL(5,2),
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  time_spent_seconds INTEGER,
  answers JSONB DEFAULT '{}',
  marked_for_review INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(test_id, student_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers and admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert their profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User roles RLS policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Tests RLS policies
CREATE POLICY "Everyone can view active tests"
  ON public.tests FOR SELECT
  USING (is_active = true);

CREATE POLICY "Teachers can create tests"
  ON public.tests FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update their own tests"
  ON public.tests FOR UPDATE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Test results RLS policies
CREATE POLICY "Students can view their own results"
  ON public.test_results FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all results"
  ON public.test_results FOR SELECT
  USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can insert their own results"
  ON public.test_results FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own results"
  ON public.test_results FOR UPDATE
  USING (auth.uid() = student_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to generate test code
CREATE OR REPLACE FUNCTION public.generate_test_code(subject_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
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