// src/lib/services/worldRecordsService.ts
import { supabase, getCurrentUser } from '../supabase';
import type { Database } from '../types/database';
import type { RecordSubmission, RecordFilters, WorldRecordWithHolders } from '../stores/worldRecordsStore';
import { SiteswapService } from './siteswapService';
import { PatternConverter } from '../utils/patternConverter';

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
   * Submit a new world record with dual notation support
   */
  static async submitRecord(submission: RecordSubmission): Promise<WorldRecord> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to submit a record');
    }

    // Validate submission and enhance with dual notation
    const enhancedSubmission = await this.validateAndEnhanceSubmission(submission);

    // Start transaction
    const { data: record, error: recordError } = await supabase
      .from('world_records')
      .insert({
        category: enhancedSubmission.category,
        subcategory: enhancedSubmission.subcategory,
        object_count: enhancedSubmission.object_count,
        pattern_siteswap: enhancedSubmission.pattern_siteswap,
        pattern_custom: enhancedSubmission.pattern_custom,
        pattern_description: enhancedSubmission.pattern_description,
        record_type: enhancedSubmission.record_type,
        value_number: enhancedSubmission.value_number,
        value_unit: enhancedSubmission.value_unit,
        date_set: enhancedSubmission.date_set,
        location: enhancedSubmission.location,
        event_name: enhancedSubmission.event_name,
        video_url: enhancedSubmission.video_url,
        video_platform: enhancedSubmission.video_platform || 'youtube',
        video_start_time: enhancedSubmission.video_start_time || 0,
        video_end_time: enhancedSubmission.video_end_time,
        verification_status: 'pending',
        source: 'user_submission',
        notes: enhancedSubmission.notes,
        tags: enhancedSubmission.tags,
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
   * Validate submission with independent dual notation support
   *
   * AlphaJuggle and siteswap notations are validated independently without
   * any cross-conversion to prevent semantic confusion.
   */
  private static async validateAndEnhanceSubmission(submission: RecordSubmission): Promise<RecordSubmission> {
    // Basic validation
    this.validateBasicSubmission(submission);

    // Enhanced submission without auto-conversion
    const enhanced = { ...submission };

    // Validate siteswap independently if present
    if (enhanced.pattern_siteswap) {
      const validation = SiteswapService.validateSiteswap(enhanced.pattern_siteswap);
      if (!validation.isValid) {
        throw new Error(`Invalid siteswap pattern: ${validation.errors.join(', ')}`);
      }

      // Auto-populate object count from siteswap if not provided
      if (!enhanced.object_count && validation.objectCount) {
        enhanced.object_count = validation.objectCount;
      }

      // Verify object count matches siteswap if both are provided
      if (enhanced.object_count && validation.objectCount && enhanced.object_count !== validation.objectCount) {
        throw new Error(`Object count (${enhanced.object_count}) doesn't match siteswap calculation (${validation.objectCount})`);
      }
    }

    // Validate AlphaJuggle notation independently if present
    if (enhanced.pattern_custom) {
      // Use existing custom pattern validation logic here if available
      // For now, basic validation that it's not empty
      if (!enhanced.pattern_custom.trim()) {
        throw new Error('AlphaJuggle pattern cannot be empty');
      }
    }

    // Note: Pattern mapping storage is disabled until proper semantic mapping is implemented
    // This prevents storing incorrect cross-notation relationships

    return enhanced;
  }

  /**
   * Basic submission validation
   */
  private static validateBasicSubmission(submission: RecordSubmission): void {
    if (!submission.category) {
      throw new Error('Category is required');
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

    // At least one pattern notation is required
    if (!submission.pattern_siteswap && !submission.pattern_custom) {
      throw new Error('Either siteswap or custom pattern notation is required');
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
   * DISABLED: Validate dual notation consistency
   *
   * Cross-notation validation is disabled to prevent semantic confusion
   * between AlphaJuggle and siteswap notation systems.
   */
  private static async validateDualNotation(siteswap: string, custom: string): Promise<void> {
    // Validate each notation independently
    const siteswapValidation = SiteswapService.validateSiteswap(siteswap);
    if (!siteswapValidation.isValid) {
      throw new Error(`Invalid siteswap: ${siteswapValidation.errors.join(', ')}`);
    }

    // AlphaJuggle validation would go here when available
    // For now, just check it's not empty
    if (!custom.trim()) {
      throw new Error('AlphaJuggle pattern cannot be empty');
    }

    // Note: Cross-notation consistency checking is intentionally disabled
    // These notation systems represent different semantic models
  }

  /**
   * DISABLED: Store pattern mapping for future reference
   *
   * Pattern mapping storage is disabled until proper semantic mapping
   * research is completed to prevent storing incorrect relationships.
   */
  private static async storePatternMapping(customPattern: string, siteswapPattern: string): Promise<void> {
    // Pattern mapping storage is intentionally disabled
    console.log('Pattern mapping storage disabled - manual verification required for cross-notation relationships');
  }

  /**
   * Get pattern suggestions for auto-completion
   */
  static async getPatternSuggestions(query: string, type: 'siteswap' | 'custom' = 'siteswap'): Promise<string[]> {
    try {
      const column = type === 'siteswap' ? 'pattern_siteswap' : 'pattern_custom';

      const { data, error } = await supabase
        .from('world_records')
        .select(column)
        .not(column, 'is', null)
        .ilike(column, `%${query}%`)
        .limit(10);

      if (error) throw error;

      return data
        .map(record => record[column])
        .filter((pattern): pattern is string => pattern !== null)
        .filter((pattern, index, array) => array.indexOf(pattern) === index); // Remove duplicates
    } catch (error) {
      console.error('Error getting pattern suggestions:', error);
      return [];
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
