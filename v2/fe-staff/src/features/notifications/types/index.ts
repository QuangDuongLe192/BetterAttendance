export type NotificationType =
  | 'new_shift'
  | 'request_approved'
  | 'request_rejected'
  | 'checkin_reminder'
  | 'announcement';

export interface NotificationDto {
  id: string;
  type: NotificationType;
  icon: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  actionTarget: string;
}

export interface NotificationsResponse {
  notifications: NotificationDto[];
  unreadCount: number;
  nextCursor: string | null;
}

export type NotificationFilter = 'all' | 'unread';
