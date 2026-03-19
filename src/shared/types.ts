export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  totalPages: number;
}

export type ArchivalStatus = 'active' | 'archived';

export interface ArchivalMetadata {
  status: ArchivalStatus;
  archivedAt?: Date;
  archivedBy?: string;
  restoredAt?: Date;
}
