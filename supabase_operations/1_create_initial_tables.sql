-- Create users table extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles enum type
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('user', 'admin', 'seller');

-- Create user profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  twitter TEXT,
  github TEXT,
  location TEXT,
  role user_role DEFAULT 'user'::user_role,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view any profile
CREATE POLICY "Anyone can view profiles" 
ON profiles FOR SELECT USING (true);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  features JSONB,
  requirements JSONB,
  use_cases JSONB,
  rating DECIMAL(3,2) DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  version TEXT,
  author_id UUID REFERENCES auth.users NOT NULL,
  token_id TEXT,
  contract_address TEXT,
  blockchain TEXT DEFAULT 'polygon',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy for anyone to view active listings
CREATE POLICY "Anyone can view active listings" 
ON listings FOR SELECT USING (status = 'active');

-- Policy for users to view their own listings regardless of status
CREATE POLICY "Users can view their own listings" 
ON listings FOR SELECT USING (auth.uid() = author_id);

-- Policy for users to update their own listings
CREATE POLICY "Users can update their own listings" 
ON listings FOR UPDATE USING (auth.uid() = author_id);

-- Policy for users to delete their own listings
CREATE POLICY "Users can delete their own listings" 
ON listings FOR DELETE USING (auth.uid() = author_id);

-- Policy for users to insert listings
CREATE POLICY "Users can insert listings" 
ON listings FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings NOT NULL,
  buyer_id UUID REFERENCES auth.users NOT NULL,
  seller_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own orders (as buyer or seller)
CREATE POLICY "Users can view their own orders" 
ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Policy for users to insert orders as buyer
CREATE POLICY "Users can insert orders as buyer" 
ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Policy for users to update their own orders as seller
CREATE POLICY "Users can update their own orders as seller" 
ON orders FOR UPDATE USING (auth.uid() = seller_id);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, user_id)
);

-- Create RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy for anyone to view reviews
CREATE POLICY "Anyone can view reviews" 
ON reviews FOR SELECT USING (true);

-- Policy for users to insert their own reviews
CREATE POLICY "Users can insert their own reviews" 
ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own reviews
CREATE POLICY "Users can update their own reviews" 
ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Create function to update listing rating when reviews change
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings
  SET rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE listing_id = NEW.listing_id
  )
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update listing rating when reviews change
CREATE TRIGGER update_listing_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_listing_rating();

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
