import { useEffect } from 'react';

const APP_NAME = 'Better Attendance';

/**
 * Sets `document.title` reactively.
 * Format: "<section> · <workspace> – Better Attendance"
 * Pass only `appName` to get "<appName> – Better Attendance".
 */
export function usePageTitle(section?: string, workspace?: string) {
  useEffect(() => {
    const parts: string[] = [];
    if (section)   parts.push(section);
    if (workspace) parts.push(workspace);
    parts.push(APP_NAME);
    document.title = parts.join(' – ');
  }, [section, workspace]);
}
