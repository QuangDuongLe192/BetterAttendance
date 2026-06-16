const STORAGE_KEY = 'ba_auth';

interface AuthState {
  token: string;
  expiresAt: number; // Unix seconds
}

function load(): AuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export const authStore = {
  get(): AuthState | null {
    const s = load();
    if (!s) return null;
    if (s.expiresAt <= Date.now() / 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return s;
  },
  set(token: string, expiresAt: number) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, expiresAt }));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
