-- Juggling World Records Platform Database Schema
-- PostgreSQL with Supabase extensions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CORE USER SYSTEM
-- =============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(200),
    bio TEXT,
    location VARCHAR(200),
    website VARCHAR(500),
    youtube_channel VARCHAR(500),
    instagram_handle VARCHAR(100),
    verification_level VARCHAR(20) DEFAULT 'basic' CHECK (verification_level IN ('basic', 'verified', 'moderator', 'admin')),
    reputation_score INTEGER DEFAULT 0,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- WORLD RECORDS SYSTEM
-- =============================================

CREATE TABLE world_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(20) NOT NULL CHECK (category IN ('balls', 'clubs', 'rings', 'bounce', 'diabolo', 'other')),
    subcategory VARCHAR(20) CHECK (subcategory IN ('force', 'lift', 'high', 'low', 'sync', 'async')),
    object_count INTEGER NOT NULL CHECK (object_count > 0),
    pattern_siteswap VARCHAR(200),
    pattern_custom VARCHAR(200),
    pattern_description TEXT,
    record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('endurance', 'flash', 'technical', 'speed')),
    value_number DECIMAL(12,3) NOT NULL CHECK (value_number > 0),
    value_unit VARCHAR(20) NOT NULL CHECK (value_unit IN ('catches', 'seconds', 'minutes', 'hours')),
    date_set DATE NOT NULL,
    location VARCHAR(200),
    event_name VARCHAR(200),
    video_url VARCHAR(1000) NOT NULL,
    video_platform VARCHAR(50) DEFAULT 'youtube' CHECK (video_platform IN ('youtube', 'vimeo', 'direct', 'other')),
    video_start_time INTEGER DEFAULT 0, -- seconds
    video_end_time INTEGER, -- seconds
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'disputed')),
    source VARCHAR(50) NOT NULL CHECK (source IN ('user_submission', 'imported', 'competition', 'migration')),
    source_url VARCHAR(500),
    difficulty_rating DECIMAL(4,2),
    notes TEXT,
    tags TEXT[], -- Array of tags for categorization
    is_current_record BOOLEAN DEFAULT false,
    superseded_by UUID REFERENCES world_records(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE TABLE record_holders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES world_records(id) ON DELETE CASCADE,
    juggler_name VARCHAR(200) NOT NULL,
    juggler_id UUID REFERENCES users(id), -- NULL if not a registered user
    is_primary_holder BOOLEAN DEFAULT true,
    order_position INTEGER DEFAULT 1, -- For team records
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- VERIFICATION SYSTEM
-- =============================================

CREATE TABLE record_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES world_records(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review')),
    moderator_id UUID REFERENCES users(id),
    moderator_notes TEXT,
    auto_verification_score DECIMAL(3,2), -- 0.00 to 1.00
    community_score DECIMAL(3,2), -- 0.00 to 1.00
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE verification_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_id UUID NOT NULL REFERENCES record_verifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    vote VARCHAR(20) NOT NULL CHECK (vote IN ('approve', 'reject', 'needs_review', 'abstain')),
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
    comment TEXT,
    expertise_areas TEXT[], -- Areas of expertise: ['balls', 'clubs', 'siteswap', etc.]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(verification_id, user_id)
);

-- =============================================
-- PATTERN SYSTEM
-- =============================================

CREATE TABLE pattern_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    custom_notation VARCHAR(200) NOT NULL,
    siteswap_notation VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty_rating DECIMAL(4,2),
    object_count INTEGER,
    pattern_type VARCHAR(50), -- 'cascade', 'fountain', 'shower', etc.
    created_by UUID REFERENCES users(id),
    verified BOOLEAN DEFAULT false,
    verification_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(custom_notation, siteswap_notation)
);

CREATE TABLE throw_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    siteswap_equivalent VARCHAR(20),
    category VARCHAR(50), -- 'basic', 'trick', 'body', 'multiplex'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PERSONAL RECORDS (EXISTING SYSTEM)
-- =============================================

CREATE TABLE personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pattern VARCHAR(200) NOT NULL,
    pattern_notation VARCHAR(20) DEFAULT 'custom' CHECK (pattern_notation IN ('custom', 'siteswap')),
    storage_key VARCHAR(250) NOT NULL, -- For backward compatibility
    max_catches INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    last_updated DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, storage_key)
);

-- =============================================
-- GAMIFICATION SYSTEM (EXISTING)
-- =============================================

CREATE TABLE user_gamification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    current_level_xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 400,
    last_level_up TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSONB, -- Store achievement progress data
    UNIQUE(user_id, achievement_id)
);

-- =============================================
-- VIDEO SYSTEM
-- =============================================

CREATE TABLE video_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID REFERENCES world_records(id) ON DELETE CASCADE,
    video_url VARCHAR(1000) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    video_id VARCHAR(200), -- Platform-specific video ID
    title VARCHAR(500),
    description TEXT,
    duration_seconds INTEGER,
    upload_date TIMESTAMP WITH TIME ZONE,
    channel_id VARCHAR(200),
    channel_name VARCHAR(200),
    view_count INTEGER,
    thumbnail_url VARCHAR(500),
    is_embeddable BOOLEAN DEFAULT true,
    quality_score DECIMAL(3,2), -- 0.00 to 1.00
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMMUNITY FEATURES
-- =============================================

CREATE TABLE record_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES world_records(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    parent_comment_id UUID REFERENCES record_comments(id),
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE TABLE record_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    record_id UUID NOT NULL REFERENCES world_records(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, record_id)
);

-- =============================================
-- AUDIT AND LOGGING
-- =============================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- World Records indexes
CREATE INDEX idx_world_records_category_count ON world_records(category, object_count);
CREATE INDEX idx_world_records_verification_status ON world_records(verification_status);
CREATE INDEX idx_world_records_date_set ON world_records(date_set DESC);
CREATE INDEX idx_world_records_current ON world_records(is_current_record) WHERE is_current_record = true;
CREATE INDEX idx_world_records_pattern_siteswap ON world_records(pattern_siteswap) WHERE pattern_siteswap IS NOT NULL;
CREATE INDEX idx_world_records_tags ON world_records USING GIN(tags);

-- Verification indexes
CREATE INDEX idx_verifications_status ON record_verifications(status);
CREATE INDEX idx_verifications_record_id ON record_verifications(record_id);
CREATE INDEX idx_verification_votes_verification_id ON verification_votes(verification_id);

-- Personal records indexes
CREATE INDEX idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX idx_personal_records_pattern ON personal_records(pattern);

-- User indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_verification_level ON users(verification_level);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and public profiles
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Personal records are private to the user
CREATE POLICY "Users can manage own personal records" ON personal_records
    FOR ALL USING (auth.uid() = user_id);

-- Gamification data is private to the user
CREATE POLICY "Users can manage own gamification data" ON user_gamification
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

-- World records are public for reading
CREATE POLICY "World records are publicly readable" ON world_records
    FOR SELECT USING (true);

-- Only authenticated users can submit records
CREATE POLICY "Authenticated users can submit records" ON world_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_world_records_updated_at BEFORE UPDATE ON world_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_records_updated_at BEFORE UPDATE ON personal_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate community verification score
CREATE OR REPLACE FUNCTION calculate_community_score(verification_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_votes INTEGER;
    approve_votes INTEGER;
    weighted_score DECIMAL;
BEGIN
    SELECT COUNT(*), 
           SUM(CASE WHEN vote = 'approve' THEN 1 ELSE 0 END)
    INTO total_votes, approve_votes
    FROM verification_votes 
    WHERE verification_id = verification_uuid;
    
    IF total_votes = 0 THEN
        RETURN 0.0;
    END IF;
    
    weighted_score := approve_votes::DECIMAL / total_votes::DECIMAL;
    RETURN weighted_score;
END;
$$ LANGUAGE plpgsql;
