// src/lib/stores/worldRecordsStore.ts
import { writable, derived } from 'svelte/store';
import { supabase, getCurrentUser } from '../supabase';
import type { Database } from '../types/database';

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

interface WorldRecordsState {
  records: WorldRecordWithHolders[];
  isLoading: boolean;
  error: string | null;
  filters: RecordFilters;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

const defaultState: WorldRecordsState = {
  records: [],
  isLoading: false,
  error: null,
  filters: {},
  totalCount: 0,
  currentPage: 1,
  pageSize: 20
};

function createWorldRecordsStore() {
  const { subscribe, update, set } = writable<WorldRecordsState>(defaultState);

  return {
    subscribe,

    // Load world records with optional filters
    async loadRecords(filters: RecordFilters = {}, page = 1, pageSize = 20) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
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

        update(state => ({
          ...state,
          records: data || [],
          totalCount: count || 0,
          currentPage: page,
          pageSize,
          filters,
          isLoading: false
        }));

      } catch (error: any) {
        console.error('Error loading world records:', error);
        update(state => ({
          ...state,
          error: error.message || 'Failed to load world records',
          isLoading: false
        }));
      }
    },

    // Submit a new world record
    async submitRecord(submission: RecordSubmission) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          throw new Error('You must be logged in to submit a record');
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

        update(state => ({ ...state, isLoading: false }));

        // Reload records to include the new submission
        this.loadRecords(state.filters, state.currentPage, state.pageSize);

        return record;

      } catch (error: any) {
        console.error('Error submitting record:', error);
        update(state => ({
          ...state,
          error: error.message || 'Failed to submit record',
          isLoading: false
        }));
        throw error;
      }
    },

    // Get a single record by ID
    async getRecord(recordId: string): Promise<WorldRecordWithHolders | null> {
      try {
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
    },

    // Update filters
    setFilters(newFilters: RecordFilters) {
      update(state => ({
        ...state,
        filters: { ...state.filters, ...newFilters }
      }));
    },

    // Clear filters
    clearFilters() {
      update(state => ({
        ...state,
        filters: {}
      }));
    },

    // Get current records (for derived stores)
    getCurrentRecords() {
      let records: WorldRecordWithHolders[] = [];
      subscribe(state => {
        records = state.records;
      })();
      return records;
    },

    // Get loading state
    getLoadingState() {
      let isLoading = false;
      subscribe(state => {
        isLoading = state.isLoading;
      })();
      return isLoading;
    },

    // Get error state
    getError() {
      let error: string | null = null;
      subscribe(state => {
        error = state.error;
      })();
      return error;
    },

    // Clear error
    clearError() {
      update(state => ({ ...state, error: null }));
    },

    // Reset store
    reset() {
      set(defaultState);
    }
  };
}

export const worldRecordsStore = createWorldRecordsStore();

// Derived stores for common use cases
export const currentRecords = derived(
  worldRecordsStore,
  $store => $store.records
);

export const verifiedRecords = derived(
  worldRecordsStore,
  $store => $store.records.filter(record => record.verification_status === 'verified')
);

export const pendingRecords = derived(
  worldRecordsStore,
  $store => $store.records.filter(record => record.verification_status === 'pending')
);

export const recordsByCategory = derived(
  worldRecordsStore,
  $store => {
    const grouped: Record<string, WorldRecordWithHolders[]> = {};
    $store.records.forEach(record => {
      if (!grouped[record.category]) {
        grouped[record.category] = [];
      }
      grouped[record.category].push(record);
    });
    return grouped;
  }
);
