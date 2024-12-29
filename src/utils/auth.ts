let TOKEN_KEY = 'token';

const isLogin = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const setTokenKey = (tokenKey: string) => {
  TOKEN_KEY = tokenKey;
};

export { isLogin, getToken, setToken, clearToken, setTokenKey };
