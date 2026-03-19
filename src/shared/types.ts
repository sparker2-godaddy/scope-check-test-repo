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

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
}
