export interface Response<T> {
  message: string;
  statusCode: number;
  data: T;
  error: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextToken: string;
  total: number;
}
