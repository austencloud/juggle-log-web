// Define the throw types
export type ThrowType = {
    code: string;
    name: string;
  };
  
  // Progress data structure
  export interface ProgressData {
    completedPatterns: string[];
    maxCatches: Record<string, number>;
    completionDates: Record<string, string>;
  }
  
  // Pattern with metadata
  export interface PatternData {
    pattern: string;
    maxCatches: number;
    dateCompleted: string | null;
    isCompleted: boolean;
  }
  
  // Sort order types
  export enum SortOrder {
    Ascending = 'ascending',
    Descending = 'descending'
  }
  
  // Sort type for pattern table
  export enum SortType {
    Pattern = 'pattern',
    MaxCatches = 'maxCatches',
    Date = 'date'
  }
  
  // Throw button definition
  export const THROW_BUTTONS: ThrowType[] = [
    { code: "S", name: "Single" },
    { code: "D", name: "Double" },
    { code: "L", name: "Lazy" },
    { code: "F", name: "Flat" },
    { code: "B", name: "Behind the back" },
    { code: "P", name: "Penguin" },
    { code: "O", name: "Over the top" },
    { code: "Od", name: "Over the top double" },
    { code: "Us", name: "Under same leg" },
    { code: "Uo", name: "Under opposite leg" },
  ];