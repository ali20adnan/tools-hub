import Cookies from 'js-cookie';

// Token management — JS-readable cookie only (shared by axios and Next middleware).
const TOKEN_KEY = 'accessToken';

export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(TOKEN_KEY) ?? null;
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    Cookies.set(TOKEN_KEY, token, {
      expires: 1, // 1 day
      path: '/',
      sameSite: 'strict',
    });
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    Cookies.remove(TOKEN_KEY, { path: '/' });
  },

  hasToken: (): boolean => !!tokenManager.getToken(),
};
