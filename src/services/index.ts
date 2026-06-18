import { USE_MOCK } from '@/constants/config';
import * as authApi from './api/auth.api';
import * as authMock from './mocks/auth.mock';
import * as entriesApi from './api/entries.api';
import * as entriesMock from './mocks/entries.mock';
import * as calendarApi from './api/calendar.api';
import * as calendarMock from './mocks/calendar.mock';
import * as notificationsApi from './api/notifications.api';
import * as notificationsMock from './mocks/notifications.mock';
import * as chatApi from './api/chat.api';
import * as chatMock from './mocks/chat.mock';
import * as studentsApi from './api/students.api';
import * as studentsMock from './mocks/students.mock';

export const authService = USE_MOCK ? authMock : authApi;
export const entriesService = USE_MOCK ? entriesMock : entriesApi;
export const calendarService = USE_MOCK ? calendarMock : calendarApi;
export const notificationsService = USE_MOCK ? notificationsMock : notificationsApi;
export const chatService = USE_MOCK ? chatMock : chatApi;
export const studentsService = USE_MOCK ? studentsMock : studentsApi;

export { getStudentName } from './mocks/store';
export { mockStore } from './mocks/store';
