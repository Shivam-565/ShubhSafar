-- User Roles Enum and Table
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'organizer');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- User Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Organizer Profiles Table
CREATE TABLE public.organizer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    organization_name TEXT NOT NULL,
    organizer_name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    location TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    id_document_url TEXT,
    certificate_url TEXT,
    address_proof_url TEXT,
    bank_details TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'pending',
    total_earnings DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;

-- Trips Table
CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES public.organizer_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    destination TEXT NOT NULL,
    category TEXT NOT NULL,
    trip_type TEXT DEFAULT 'public',
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    duration_days INTEGER NOT NULL DEFAULT 1,
    max_participants INTEGER DEFAULT 50,
    current_participants INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    image_url TEXT,
    itinerary JSONB,
    inclusions TEXT[],
    exclusions TEXT[],
    meeting_point TEXT,
    difficulty_level TEXT DEFAULT 'easy',
    is_educational BOOLEAN DEFAULT false,
    education_type TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Bookings Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organizer_id UUID REFERENCES public.organizer_profiles(id) ON DELETE CASCADE NOT NULL,
    booking_status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    amount_paid DECIMAL(10,2) NOT NULL,
    participants_count INTEGER DEFAULT 1,
    participant_name TEXT,
    participant_email TEXT,
    participant_phone TEXT,
    id_card_url TEXT,
    special_requirements TEXT,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Wishlist Table
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, trip_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Reviews Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    transaction_id TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Chat Messages Table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Educational Trip Requests Table
CREATE TABLE public.educational_trip_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_name TEXT NOT NULL,
    institution_name TEXT NOT NULL,
    institution_type TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    student_count INTEGER,
    preferred_destinations TEXT,
    preferred_dates TEXT,
    special_requirements TEXT,
    assigned_organizer_id UUID REFERENCES public.organizer_profiles(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.educational_trip_requests ENABLE ROW LEVEL SECURITY;

-- User Settings Table
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('trip-images', 'trip-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('id-cards', 'id-cards', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('organizer-docs', 'organizer-docs', false);

-- RLS Policies

-- User Roles Policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles Policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Organizer Profiles Policies
CREATE POLICY "Anyone can view verified organizers" ON public.organizer_profiles FOR SELECT USING (true);
CREATE POLICY "Organizers can update own profile" ON public.organizer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Organizers can insert own profile" ON public.organizer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trips Policies
CREATE POLICY "Anyone can view active trips" ON public.trips FOR SELECT USING (is_active = true);
CREATE POLICY "Organizers can manage own trips" ON public.trips FOR ALL USING (
    EXISTS (SELECT 1 FROM public.organizer_profiles WHERE id = organizer_id AND user_id = auth.uid())
);

-- Bookings Policies
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Organizers can view bookings for their trips" ON public.bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organizer_profiles WHERE id = organizer_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Organizers can update booking status" ON public.bookings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.organizer_profiles WHERE id = organizer_id AND user_id = auth.uid())
);

-- Wishlist Policies
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Reviews Policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Payments Policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat Messages Policies
CREATE POLICY "Users can manage own chat messages" ON public.chat_messages FOR ALL USING (auth.uid() = user_id);

-- Educational Trip Requests Policies
CREATE POLICY "Anyone can create requests" ON public.educational_trip_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Assigned organizers can view requests" ON public.educational_trip_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organizer_profiles WHERE id = assigned_organizer_id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins can update requests" ON public.educational_trip_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- User Settings Policies
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Storage Policies
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Organizers can upload trip images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'trip-images' AND public.has_role(auth.uid(), 'organizer'));
CREATE POLICY "Anyone can view trip images" ON storage.objects FOR SELECT USING (bucket_id = 'trip-images');

CREATE POLICY "Users can upload ID cards" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'id-cards' AND auth.role() = 'authenticated');
CREATE POLICY "Users can view own ID cards" ON storage.objects FOR SELECT USING (bucket_id = 'id-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Organizers can upload docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'organizer-docs' AND auth.role() = 'authenticated');
CREATE POLICY "Organizers can view own docs" ON storage.objects FOR SELECT USING (bucket_id = 'organizer-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all docs" ON storage.objects FOR SELECT USING (bucket_id = 'organizer-docs' AND public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizer_profiles_updated_at BEFORE UPDATE ON public.organizer_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();