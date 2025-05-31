// src/lib/services/worldRecordsService.ts
import { supabase, getCurrentUser } from '../supabase';
import type { Database } from '../types/database';
import type { RecordSubmission, RecordFilters, WorldRecordWithHolders } from '../stores/worldRecordsStore';

type WorldRecord = Database['public']['Tables']['world_records']['Row'];
type WorldRecordInsert = Database['public']['Tables']['world_records']['Insert'];
type WorldRecordUpdate = Database['public']['Tables']['world_records']['Update'];

export class WorldRecordsService {
  
  /**
   * Search and filter world records
   */
  static async searchRecords(
    filters: RecordFilters = {},
    page = 1,
    pageSize = 20,
    orderBy: 'date_set' | 'value_number' | 'created_at' = 'date_set',
    ascending = false
  ) {
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
      query = query.or(`
        pattern_description.ilike.%${filters.search}%,
        notes.ilike.%${filters.search}%,
        pattern_siteswap.ilike.%${filters.search}%,
        pattern_custom.ilike.%${filters.search}%
      `);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Ordering
    query = query.order(orderBy, { ascending });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching records:', error);
      throw error;
    }

    return {
      records: data as WorldRecordWithHolders[],
      totalCount: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  }

  /**
   * Get a single record by ID with full details
   */
  static async getRecordById(recordId: string): Promise<WorldRecordWithHolders | null> {
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
          moderator_notes,
          submitted_by,
          submission_date
        )
      `)
      .eq('id', recordId)
      .single();

    if (error) {
      console.error('Error getting record:', error);
      throw error;
    }

    return data as WorldRecordWithHolders;
  }

  /**
   * Submit a new world record
   */
  static async submitRecord(submission: RecordSubmission): Promise<WorldRecord> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to submit a record');
    }

    // Validate submission
    this.validateSubmission(submission);

    // Start transaction
    const { data: record, error: recordError } = await supabase
      .from('world_records')
      .insert({
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
      } as WorldRecordInsert)
      .select()
      .single();

    if (recordError) {
      console.error('Error inserting record:', recordError);
      throw recordError;
    }

    // Insert record holders
    const holdersData = submission.holder_names.map((name, index) => ({
      record_id: record.id,
      juggler_name: name.trim(),
      juggler_id: null, // TODO: Try to match with existing users
      is_primary_holder: index === 0,
      order_position: index + 1
    }));

    const { error: holdersError } = await supabase
      .from('record_holders')
      .insert(holdersData);

    if (holdersError) {
      console.error('Error inserting record holders:', holdersError);
      // Clean up the record if holders insertion fails
      await supabase.from('world_records').delete().eq('id', record.id);
      throw holdersError;
    }

    // Create verification entry
    const { error: verificationError } = await supabase
      .from('record_verifications')
      .insert({
        record_id: record.id,
        submitted_by: currentUser.id,
        status: 'pending'
      });

    if (verificationError) {
      console.error('Error creating verification:', verificationError);
      // This is not critical, so we don't roll back
    }

    return record;
  }

  /**
   * Update an existing record (admin/moderator only)
   */
  static async updateRecord(recordId: string, updates: WorldRecordUpdate): Promise<WorldRecord> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to update a record');
    }

    // TODO: Check if user has permission to update records

    const { data, error } = await supabase
      .from('world_records')
      .update(updates)
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      console.error('Error updating record:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a record (admin only)
   */
  static async deleteRecord(recordId: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to delete a record');
    }

    // TODO: Check if user has admin permission

    const { error } = await supabase
      .from('world_records')
      .delete()
      .eq('id', recordId);

    if (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  }

  /**
   * Get records by category
   */
  static async getRecordsByCategory(category: string, limit = 10) {
    const { data, error } = await supabase
      .from('world_records')
      .select(`
        *,
        record_holders (
          juggler_name,
          is_primary_holder
        )
      `)
      .eq('category', category)
      .eq('verification_status', 'verified')
      .order('value_number', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting records by category:', error);
      throw error;
    }

    return data as WorldRecordWithHolders[];
  }

  /**
   * Get current world records (highest verified record for each category/object count combination)
   */
  static async getCurrentWorldRecords() {
    const { data, error } = await supabase
      .from('world_records')
      .select(`
        *,
        record_holders (
          juggler_name,
          is_primary_holder
        )
      `)
      .eq('is_current_record', true)
      .eq('verification_status', 'verified')
      .order('category')
      .order('object_count');

    if (error) {
      console.error('Error getting current world records:', error);
      throw error;
    }

    return data as WorldRecordWithHolders[];
  }

  /**
   * Get recent records
   */
  static async getRecentRecords(limit = 10) {
    const { data, error } = await supabase
      .from('world_records')
      .select(`
        *,
        record_holders (
          juggler_name,
          is_primary_holder
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting recent records:', error);
      throw error;
    }

    return data as WorldRecordWithHolders[];
  }

  /**
   * Validate record submission
   */
  private static validateSubmission(submission: RecordSubmission): void {
    if (!submission.category) {
      throw new Error('Category is required');
    }

    if (!submission.object_count || submission.object_count < 1) {
      throw new Error('Object count must be at least 1');
    }

    if (!submission.record_type) {
      throw new Error('Record type is required');
    }

    if (!submission.value_number || submission.value_number <= 0) {
      throw new Error('Record value must be greater than 0');
    }

    if (!submission.value_unit) {
      throw new Error('Value unit is required');
    }

    if (!submission.date_set) {
      throw new Error('Date set is required');
    }

    if (!submission.video_url) {
      throw new Error('Video URL is required');
    }

    if (!submission.holder_names || submission.holder_names.length === 0) {
      throw new Error('At least one record holder is required');
    }

    // Validate video URL format
    if (!this.isValidVideoUrl(submission.video_url)) {
      throw new Error('Invalid video URL format');
    }

    // Validate date is not in the future
    const recordDate = new Date(submission.date_set);
    const today = new Date();
    if (recordDate > today) {
      throw new Error('Record date cannot be in the future');
    }
  }

  /**
   * Validate video URL
   */
  private static isValidVideoUrl(url: string): boolean {
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return false;
    }

    // Check for supported platforms
    const supportedPlatforms = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'instagram.com'
    ];

    return supportedPlatforms.some(platform => url.includes(platform));
  }
}
