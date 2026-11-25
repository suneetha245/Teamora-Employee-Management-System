const KEY = 'teamora_token';

// "Remember me" keeps the session across browser restarts (localStorage); otherwise it ends with the tab.
export const getToken = () => localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
export const setToken = (token, remember) => {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(KEY, token);
};
export const clearToken = () => {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
};
