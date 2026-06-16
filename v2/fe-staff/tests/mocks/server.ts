import { setupServer } from 'msw/node';
import { attendanceHandlers } from './handlers/attendance.handlers';
import { authHandlers } from './handlers/auth.handlers';
import { notificationsHandlers } from './handlers/notifications.handlers';
import { requestsHandlers } from './handlers/requests.handlers';

export const server = setupServer(
  ...authHandlers,
  ...attendanceHandlers,
  ...notificationsHandlers,
  ...requestsHandlers,
);
