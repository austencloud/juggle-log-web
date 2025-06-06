// src/lib/stores/worldRecordsState.ts - Svelte 5 Runes-based World Records State Management
import { supabase, getCurrentUser, isSupabaseConfigured } from '../supabase';
import type { Database } from '../types/database';
import type { UserState } from './userState';

type WorldRecord = Database['public']['Tables']['world_records']['Row'];
type WorldRecordInsert = Database['public']['Tables']['world_records']['Insert'];
type WorldRecordUpdate = Database['public']['Tables']['world_records']['Update'];
type RecordHolder = Database['public']['Tables']['record_holders']['Row'];
type RecordVerification = Database['public']['Tables']['record_verifications']['Row'];

export interface WorldRecordWithHolders extends WorldRecord {
  record_holders: RecordHolder[];
  verification?: RecordVerification;
}

export interface RecordFilters {
  category?: string;
  subcategory?: string;
  objectCount?: number;
  recordType?: string;
  verificationStatus?: string;
  search?: string;
  tags?: string[];
}

export interface RecordSubmission {
  category: WorldRecord['category'];
  subcategory?: WorldRecord['subcategory'];
  object_count: number;
  pattern_siteswap?: string;
  pattern_custom?: string;
  pattern_description?: string;
  record_type: WorldRecord['record_type'];
  value_number: number;
  value_unit: WorldRecord['value_unit'];
  date_set: string;
  location?: string;
  event_name?: string;
  video_url: string;
  video_platform?: WorldRecord['video_platform'];
  video_start_time?: number;
  video_end_time?: number;
  notes?: string;
  tags?: string[];
  holder_names: string[];
}

interface WorldRecordsStateData {
  records: WorldRecordWithHolders[];
  isLoading: boolean;
  error: string | null;
  filters: RecordFilters;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

const defaultState: WorldRecordsStateData = {
  records: [],
  isLoading: false,
  error: null,
  filters: {},
  totalCount: 0,
  currentPage: 1,
  pageSize: 20
};

/**
 * Svelte 5 Runes-based World Records State Management
 * Manages world records data, filtering, and Supabase integration
 */
export class WorldRecordsState {
  // Core reactive state using $state()
  private _records = $state<WorldRecordWithHolders[]>([]);
  private _isLoading = $state(false);
  private _error = $state<string | null>(null);
  private _filters = $state<RecordFilters>({});
  private _totalCount = $state(0);
  private _currentPage = $state(1);
  private _pageSize = $state(20);

  // Derived state using $derived()
  readonly filteredRecords = $derived(() => {
    let filtered = this._records;

    // Apply client-side filtering if needed
    if (this._filters.search) {
      const searchTerm = this._filters.search.toLowerCase();
      filtered = filtered.filter(record => 
        record.pattern_description?.toLowerCase().includes(searchTerm) ||
        record.notes?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  });

  readonly recordsByPattern = $derived(() => {
    const grouped: Record<string, WorldRecordWithHolders[]> = {};
    this._records.forEach(record => {
      const pattern = record.pattern_description || 'Unknown';
      if (!grouped[pattern]) {
        grouped[pattern] = [];
      }
      grouped[pattern].push(record);
    });
    return grouped;
  });

  readonly verifiedRecords = $derived(() => 
    this._records.filter(record => record.verification_status === 'verified')
  );

  readonly pendingRecords = $derived(() => 
    this._records.filter(record => record.verification_status === 'pending')
  );

  readonly recordsByCategory = $derived(() => {
    const grouped: Record<string, WorldRecordWithHolders[]> = {};
    this._records.forEach(record => {
      if (!grouped[record.category]) {
        grouped[record.category] = [];
      }
      grouped[record.category].push(record);
    });
    return grouped;
  });

  readonly userRecords = $derived(() => {
    if (!this.userState?.currentUser) return [];
    const userId = this.userState.currentUser.id;
    return this._records.filter(record => record.created_by === userId);
  });

  readonly leaderboards = $derived(() => {
    const leaderboards: Record<string, WorldRecordWithHolders[]> = {};
    
    // Group by category and record type, then sort by value
    this.verifiedRecords.forEach(record => {
      const key = `${record.category}_${record.record_type}`;
      if (!leaderboards[key]) {
        leaderboards[key] = [];
      }
      leaderboards[key].push(record);
    });

    // Sort each leaderboard by value (descending for most record types)
    Object.keys(leaderboards).forEach(key => {
      leaderboards[key].sort((a, b) => b.value_number - a.value_number);
    });

    return leaderboards;
  });

  // Getters for reactive state
  get records() { return this._records; }
  get isLoading() { return this._isLoading; }
  get error() { return this._error; }
  get filters() { return this._filters; }
  get totalCount() { return this._totalCount; }
  get currentPage() { return this._currentPage; }
  get pageSize() { return this._pageSize; }

  constructor(private userState?: UserState) {
    // Set up real-time subscriptions when Supabase is configured
    if (isSupabaseConfigured()) {
      this.setupRealtimeSubscriptions();
    }
  }

  /**
   * Set up real-time subscriptions for live updates
   */
  private setupRealtimeSubscriptions(): void {
    $effect(() => {
      if (!supabase) return;

      const subscription = supabase
        .channel('world_records_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'world_records' },
          (payload) => {
            console.log('World record change detected:', payload);
            // Refresh records when changes occur
            this.loadRecords(this._filters, this._currentPage, this._pageSize);
          }
        )
        .subscribe();

      // Cleanup subscription on effect cleanup
      return () => {
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Load world records with optional filters
   */
  async loadRecords(filters: RecordFilters = {}, page = 1, pageSize = 20): Promise<void> {
    this._isLoading = true;
    this._error = null;

    if (!isSupabaseConfigured()) {
      this._error = 'Database not configured';
      this._isLoading = false;
      return;
    }

    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      let query = supabase
        .from('world_records')
        .select(`
          *,
          record_holders (
            id,
            juggler_name,
            juggler_id,
            is_primary_holder,
            order_position
          ),
          record_verifications (
            id,
            status,
            community_score,
            approved_at
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }
      if (filters.objectCount) {
        query = query.eq('object_count', filters.objectCount);
      }
      if (filters.recordType) {
        query = query.eq('record_type', filters.recordType);
      }
      if (filters.verificationStatus) {
        query = query.eq('verification_status', filters.verificationStatus);
      }
      if (filters.search) {
        query = query.or(`pattern_description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Order by date set (newest first) and then by value
      query = query.order('date_set', { ascending: false });
      query = query.order('value_number', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      this._records = data || [];
      this._totalCount = count || 0;
      this._currentPage = page;
      this._pageSize = pageSize;
      this._filters = filters;

    } catch (error: any) {
      console.error('Error loading world records:', error);
      this._error = error.message || 'Failed to load world records';
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Submit a new world record
   */
  async submitRecord(submission: RecordSubmission): Promise<WorldRecord> {
    this._isLoading = true;
    this._error = null;

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('You must be logged in to submit a record');
      }

      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Insert the world record
      const recordData: WorldRecordInsert = {
        category: submission.category,
        subcategory: submission.subcategory,
        object_count: submission.object_count,
        pattern_siteswap: submission.pattern_siteswap,
        pattern_custom: submission.pattern_custom,
        pattern_description: submission.pattern_description,
        record_type: submission.record_type,
        value_number: submission.value_number,
        value_unit: submission.value_unit,
        date_set: submission.date_set,
        location: submission.location,
        event_name: submission.event_name,
        video_url: submission.video_url,
        video_platform: submission.video_platform || 'youtube',
        video_start_time: submission.video_start_time || 0,
        video_end_time: submission.video_end_time,
        verification_status: 'pending',
        source: 'user_submission',
        notes: submission.notes,
        tags: submission.tags,
        created_by: currentUser.id
      };

      const { data: record, error: recordError } = await supabase
        .from('world_records')
        .insert(recordData)
        .select()
        .single();

      if (recordError) throw recordError;

      // Insert record holders
      const holdersData = submission.holder_names.map((name, index) => ({
        record_id: record.id,
        juggler_name: name,
        juggler_id: null, // TODO: Try to match with existing users
        is_primary_holder: index === 0,
        order_position: index + 1
      }));

      const { error: holdersError } = await supabase
        .from('record_holders')
        .insert(holdersData);

      if (holdersError) throw holdersError;

      // Create verification entry
      const { error: verificationError } = await supabase
        .from('record_verifications')
        .insert({
          record_id: record.id,
          submitted_by: currentUser.id,
          status: 'pending'
        });

      if (verificationError) throw verificationError;

      // Reload records to include the new submission
      await this.loadRecords(this._filters, this._currentPage, this._pageSize);

      return record;

    } catch (error: any) {
      console.error('Error submitting record:', error);
      this._error = error.message || 'Failed to submit record';
      throw error;
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Get a single record by ID
   */
  async getRecord(recordId: string): Promise<WorldRecordWithHolders | null> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data, error } = await supabase
        .from('world_records')
        .select(`
          *,
          record_holders (
            id,
            juggler_name,
            juggler_id,
            is_primary_holder,
            order_position
          ),
          record_verifications (
            id,
            status,
            community_score,
            approved_at,
            moderator_notes
          )
        `)
        .eq('id', recordId)
        .single();

      if (error) throw error;
      return data;

    } catch (error: any) {
      console.error('Error getting record:', error);
      return null;
    }
  }

  /**
   * Update filters
   */
  setFilters(newFilters: RecordFilters): void {
    this._filters = { ...this._filters, ...newFilters };
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this._filters = {};
  }

  /**
   * Clear error
   */
  clearError(): void {
    this._error = null;
  }

  /**
   * Reset store
   */
  reset(): void {
    this._records = [];
    this._isLoading = false;
    this._error = null;
    this._filters = {};
    this._totalCount = 0;
    this._currentPage = 1;
    this._pageSize = 20;
  }
}

// Create and export the singleton instance
// Dependencies will be injected after all states are created
export const worldRecordsState = new WorldRecordsState();
