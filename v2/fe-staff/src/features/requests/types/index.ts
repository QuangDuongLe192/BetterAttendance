export type RequestType = 'leave' | 'late' | 'early';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export interface RequestDto {
  id: string;
  type: RequestType;
  status: RequestStatus;
  startDate: string;
  endDate?: string;
  time?: string;
  reason: string;
  submittedAt: number;
  reviewerName?: string;
  reviewedAt?: number | null;
  reviewComment?: string;
}

export interface RequestsResponse {
  requests: RequestDto[];
  counts: Record<StatusFilter, number>;
  nextCursor: string | null;
}

export type CreateLeaveRequest = {
  type: 'leave';
  startDate: string;
  endDate: string;
  reason: string;
};

export type CreateLateEarlyRequest = {
  type: 'late' | 'early';
  startDate: string;
  time: string;
  reason: string;
};

export type CreateRequestPayload = CreateLeaveRequest | CreateLateEarlyRequest;
