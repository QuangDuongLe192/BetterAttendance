declare global {
  interface Window {
    tt?: {
      requestAuthCode: (opts: {
        appId: string;
        success: (r: { code: string }) => void;
        fail: (err: unknown) => void;
      }) => void;
    };
  }
}

export function getLarkAuthCode(appId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window.tt?.requestAuthCode !== 'function') {
      reject(new Error('Lark SDK not available'));
      return;
    }
    window.tt.requestAuthCode({
      appId,
      success: (r) => resolve(r.code),
      fail: (err) => reject(err),
    });
  });
}
