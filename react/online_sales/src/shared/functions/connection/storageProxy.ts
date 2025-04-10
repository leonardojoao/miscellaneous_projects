export const setAccessToken = (key: string, accessToken: string) => {
  localStorage.setItem(key, accessToken);
};

export const getAccessToken = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const removeAccessToken = (key: string) => {
  localStorage.removeItem(key);
};

export const clearAccessToken = () => {
  localStorage.clear();
};
