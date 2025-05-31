# Technical Analysis and System Architecture

## Current System Architecture Analysis

### Technology Stack Assessment
- **Frontend**: SvelteKit with TypeScript - ✅ Modern, scalable
- **State Management**: Svelte stores - ✅ Suitable for expansion
- **Data Persistence**: localStorage - ⚠️ Needs database upgrade
- **Styling**: CSS with custom properties - ✅ Maintainable
- **Build System**: Vite - ✅ Fast, modern

### Current Data Models

#### Pattern System Analysis
```typescript
// Current throw types (custom notation)
const THROW_BUTTONS: ThrowType[] = [
  { code: 'S', name: 'Single', difficulty: 1 },
  { code: 'D', name: 'Double', difficulty: 2 },
  { code: 'L', name: 'Lazy', difficulty: 2 },
  { code: 'F', name: 'Flat', difficulty: 2 },
  { code: 'B', name: 'Behind the back', difficulty: 3 },
  { code: 'P', name: 'Penguin', difficulty: 3 },
  { code: 'O', name: 'Over the top', difficulty: 3 },
  { code: 'Od', name: 'Over the top double', difficulty: 4 },
  { code: 'Us', name: 'Under same leg', difficulty: 3 },
  { code: 'Uo', name: 'Under opposite leg', difficulty: 4 },
  { code: 'Cd', name: 'Circus Double', difficulty: 4 }
];
```

#### Current Progress Tracking
```typescript
interface ProgressData {
  completedPatterns: string[];
  maxCatches: Record<string, number>;
  lastUpdatedDates: Record<string, string>;
}

interface PatternData {
  pattern: string; // e.g., "DS", "SDF"
  storageKey: string; // e.g., "DS_R", "DS_L" for even-length patterns
  maxCatches: number;
  lastUpdated: string | null;
  isCompleted: boolean; // maxCatches >= 100
}
```

## Required Database Schema for World Records

### Core Tables Design

#### 1. World Records Table
```sql
CREATE TABLE world_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(20) NOT NULL, -- 'balls', 'clubs', 'rings', 'bounce', 'diabolo'
  subcategory VARCHAR(20), -- 'force', 'lift', 'high', 'low'
  object_count INTEGER NOT NULL,
  pattern_siteswap VARCHAR(100), -- Standard siteswap notation
  pattern_custom VARCHAR(100), -- Current system notation
  pattern_description TEXT,
  record_type VARCHAR(20) NOT NULL, -- 'endurance', 'flash', 'technical'
  value_number DECIMAL(10,2) NOT NULL,
  value_unit VARCHAR(20) NOT NULL, -- 'catches', 'seconds', 'minutes'
  date_set DATE NOT NULL,
  location VARCHAR(200),
  video_url VARCHAR(500) NOT NULL,
  video_platform VARCHAR(50) DEFAULT 'youtube',
  verification_status VARCHAR(20) DEFAULT 'pending',
  source VARCHAR(50) NOT NULL, -- 'user_submission', 'imported', 'competition'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Record Holders Table
```sql
CREATE TABLE record_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES world_records(id),
  juggler_name VARCHAR(200) NOT NULL,
  juggler_id UUID REFERENCES users(id), -- If registered user
  is_primary_holder BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. Verification System Tables
```sql
CREATE TABLE record_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES world_records(id),
  submitted_by UUID REFERENCES users(id),
  submission_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  moderator_id UUID REFERENCES users(id),
  moderator_notes TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE verification_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID REFERENCES record_verifications(id),
  user_id UUID REFERENCES users(id),
  vote VARCHAR(20) NOT NULL, -- 'approve', 'reject', 'needs_review'
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(verification_id, user_id)
);
```

#### 4. Enhanced User System
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(200),
  bio TEXT,
  location VARCHAR(200),
  website VARCHAR(500),
  youtube_channel VARCHAR(500),
  verification_level VARCHAR(20) DEFAULT 'basic', -- 'basic', 'verified', 'moderator', 'admin'
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

#### 5. Pattern Mapping Table
```sql
CREATE TABLE pattern_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_notation VARCHAR(100) NOT NULL,
  siteswap_notation VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty_rating INTEGER,
  created_by UUID REFERENCES users(id),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(custom_notation, siteswap_notation)
);
```

## Database Technology Recommendations

### Option 1: Supabase (Recommended)
**Pros:**
- PostgreSQL-based with real-time subscriptions
- Built-in authentication and authorization
- Row Level Security (RLS) for data protection
- Real-time updates for collaborative features
- File storage for video thumbnails/metadata
- Edge functions for serverless processing

**Implementation:**
```typescript
// Supabase client setup
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
)

// Real-time record updates
const recordsSubscription = supabase
  .channel('world_records')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'world_records' },
    (payload) => {
      // Update UI with new records
    }
  )
  .subscribe()
```

### Option 2: PlanetScale + Prisma
**Pros:**
- MySQL-compatible with branching
- Excellent TypeScript integration
- Schema migrations with branching
- Serverless scaling

### Option 3: Turso (SQLite)
**Pros:**
- SQLite-based, very fast
- Edge deployment
- Cost-effective
- Good for read-heavy workloads

## Video Integration Architecture

### YouTube API Integration
```typescript
interface VideoVerification {
  videoId: string;
  title: string;
  description: string;
  duration: number; // seconds
  uploadDate: Date;
  channelId: string;
  channelName: string;
  viewCount: number;
  isEmbeddable: boolean;
  thumbnailUrl: string;
}

class YouTubeService {
  async validateVideo(url: string): Promise<VideoVerification> {
    const videoId = this.extractVideoId(url);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${API_KEY}`
    );
    // Process and validate video data
  }

  async embedVideo(videoId: string): Promise<string> {
    return `https://www.youtube.com/embed/${videoId}`;
  }
}
```

### Video Validation Rules
```typescript
interface VideoValidationRules {
  minDuration: number; // seconds
  maxDuration: number; // seconds
  requiredQuality: 'hd720' | 'hd1080';
  mustShowFullPattern: boolean;
  mustShowClearView: boolean;
  allowedPlatforms: ('youtube' | 'vimeo' | 'direct')[];
}

const RECORD_VALIDATION_RULES: Record<string, VideoValidationRules> = {
  endurance: {
    minDuration: 60,
    maxDuration: 14400, // 4 hours
    requiredQuality: 'hd720',
    mustShowFullPattern: true,
    mustShowClearView: true,
    allowedPlatforms: ['youtube', 'vimeo']
  },
  flash: {
    minDuration: 10,
    maxDuration: 300,
    requiredQuality: 'hd720',
    mustShowFullPattern: true,
    mustShowClearView: true,
    allowedPlatforms: ['youtube', 'vimeo', 'direct']
  }
};
```

## Siteswap Integration Strategy

### Notation Conversion System
```typescript
interface NotationConverter {
  customToSiteswap(customPattern: string): string | null;
  siteswapToCustom(siteswap: string): string | null;
  validateSiteswap(siteswap: string): boolean;
  calculateDifficulty(pattern: string, notation: 'custom' | 'siteswap'): number;
}

// Example mappings
const THROW_MAPPINGS: Record<string, string> = {
  'S': '3', // Single = 3 in siteswap
  'D': '4', // Double = 4 in siteswap  
  'L': '2', // Lazy = 2 in siteswap
  'F': '3', // Flat = 3 with modifier
  // Complex mappings may require context
};
```

### Pattern Difficulty Calculation
```typescript
class PatternAnalyzer {
  calculateDifficulty(pattern: string, notation: 'custom' | 'siteswap'): number {
    if (notation === 'siteswap') {
      return this.siteswapDifficulty(pattern);
    } else {
      return this.customDifficulty(pattern);
    }
  }

  private siteswapDifficulty(siteswap: string): number {
    // Standard siteswap difficulty calculation
    const throws = siteswap.split('').map(Number);
    const avgHeight = throws.reduce((a, b) => a + b) / throws.length;
    const variance = this.calculateVariance(throws);
    return avgHeight + (variance * 0.5);
  }
}
```

## API Design for External Integration

### Public API Endpoints
```typescript
// GET /api/records
interface RecordsQuery {
  category?: string;
  objectCount?: number;
  recordType?: string;
  verified?: boolean;
  limit?: number;
  offset?: number;
}

// POST /api/records
interface RecordSubmission {
  category: string;
  objectCount: number;
  pattern?: string;
  recordType: string;
  value: number;
  unit: string;
  videoUrl: string;
  holderNames: string[];
  location?: string;
  notes?: string;
}

// GET /api/records/{id}/verifications
interface VerificationResponse {
  record: WorldRecord;
  verifications: RecordVerification[];
  communityVotes: VerificationVote[];
  status: string;
}
```

### Webhook System for External Updates
```typescript
interface WebhookConfig {
  url: string;
  events: ('record_created' | 'record_verified' | 'record_disputed')[];
  secret: string;
  active: boolean;
}

class WebhookService {
  async notifyRecordUpdate(record: WorldRecord, event: string) {
    const webhooks = await this.getActiveWebhooks(event);
    for (const webhook of webhooks) {
      await this.sendWebhook(webhook, { record, event });
    }
  }
}
```

## Migration Strategy from Current System

### Phase 1: Database Setup
1. Set up Supabase project with schema
2. Implement authentication system
3. Create data migration scripts for existing localStorage data

### Phase 2: Dual System Support
1. Maintain existing localStorage for personal records
2. Add world records database layer
3. Implement pattern notation conversion

### Phase 3: Feature Integration
1. Video verification system
2. Community moderation tools
3. Record submission workflow

### Phase 4: Data Import
1. Import Juggle Wiki data
2. Establish Juggling Edge partnership
3. Community-driven record verification

## Performance Considerations

### Caching Strategy
```typescript
// Redis caching for frequently accessed records
interface CacheStrategy {
  worldRecords: '1h'; // Cache world records for 1 hour
  userRecords: '5m';  // Cache user records for 5 minutes
  verifications: '30m'; // Cache verification status
  videos: '24h';      // Cache video metadata
}
```

### Database Indexing
```sql
-- Performance indexes
CREATE INDEX idx_records_category_count ON world_records(category, object_count);
CREATE INDEX idx_records_verification_status ON world_records(verification_status);
CREATE INDEX idx_records_date_set ON world_records(date_set DESC);
CREATE INDEX idx_verifications_status ON record_verifications(status);
```

This technical analysis provides the foundation for implementing a scalable, community-driven world records platform while preserving the existing personal tracking functionality.
