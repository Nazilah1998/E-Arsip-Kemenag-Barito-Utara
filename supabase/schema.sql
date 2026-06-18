-- E-Arsip Kemenag Database Schema

CREATE SCHEMA IF NOT EXISTS kemenag_arsip;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: bidang (Department/Seksi)
CREATE TABLE IF NOT EXISTS kemenag_arsip.bidang (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: users_metadata
-- Note: users table is managed by Supabase Auth (auth.users). 
-- We create a metadata table linked via foreign key to auth.users.
CREATE TABLE IF NOT EXISTS kemenag_arsip.users_metadata (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Super Admin', 'Admin Bidang')),
    bidang_id UUID REFERENCES kemenag_arsip.bidang(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: folders
CREATE TABLE IF NOT EXISTS kemenag_arsip.folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES kemenag_arsip.folders(id) ON DELETE CASCADE,
    bidang_id UUID REFERENCES kemenag_arsip.bidang(id) ON DELETE CASCADE,
    is_restricted BOOLEAN DEFAULT false,
    created_by UUID REFERENCES kemenag_arsip.users_metadata(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Table: files
CREATE TABLE IF NOT EXISTS kemenag_arsip.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    folder_id UUID REFERENCES kemenag_arsip.folders(id) ON DELETE CASCADE,
    bidang_id UUID REFERENCES kemenag_arsip.bidang(id) ON DELETE CASCADE,
    r2_object_key VARCHAR(1024) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    is_restricted BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES kemenag_arsip.users_metadata(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE kemenag_arsip.bidang ENABLE ROW LEVEL SECURITY;
ALTER TABLE kemenag_arsip.users_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE kemenag_arsip.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE kemenag_arsip.files ENABLE ROW LEVEL SECURITY;

-- Helper Function to get user role and bidang_id
CREATE OR REPLACE FUNCTION kemenag_arsip.get_user_role() RETURNS text AS $$
  SELECT role FROM kemenag_arsip.users_metadata WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION kemenag_arsip.get_user_bidang_id() RETURNS uuid AS $$
  SELECT bidang_id FROM kemenag_arsip.users_metadata WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies for bidang
-- Super Admin can read/write everything. Admin Bidang can only read.
CREATE POLICY "Super Admins can do everything on bidang" ON kemenag_arsip.bidang
    FOR ALL USING (kemenag_arsip.get_user_role() = 'Super Admin');

CREATE POLICY "Admin Bidang can view all bidang" ON kemenag_arsip.bidang
    FOR SELECT USING (true); -- everyone can view the names of bidang

-- RLS Policies for users_metadata
CREATE POLICY "Super Admins can do everything on users" ON kemenag_arsip.users_metadata
    FOR ALL USING (kemenag_arsip.get_user_role() = 'Super Admin');

CREATE POLICY "Users can view their own metadata" ON kemenag_arsip.users_metadata
    FOR SELECT USING (auth.uid() = id);

-- RLS Policies for folders
CREATE POLICY "Super Admins can do everything on folders" ON kemenag_arsip.folders
    FOR ALL USING (kemenag_arsip.get_user_role() = 'Super Admin');

CREATE POLICY "Admin Bidang can do everything on their own bidang folders" ON kemenag_arsip.folders
    FOR ALL USING (
        kemenag_arsip.get_user_role() = 'Admin Bidang' AND 
        bidang_id = kemenag_arsip.get_user_bidang_id()
    );

-- RLS Policies for files
CREATE POLICY "Super Admins can do everything on files" ON kemenag_arsip.files
    FOR ALL USING (kemenag_arsip.get_user_role() = 'Super Admin');

CREATE POLICY "Admin Bidang can do everything on their own bidang files" ON kemenag_arsip.files
    FOR ALL USING (
        kemenag_arsip.get_user_role() = 'Admin Bidang' AND 
        bidang_id = kemenag_arsip.get_user_bidang_id()
    );
