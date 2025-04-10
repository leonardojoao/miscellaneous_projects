import { AUTHORIZATION_KEY } from '../../constants/authorizationConstants';
import { getAccessToken, removeAccessToken, setAccessToken } from './storageProxy';

export const unsetAuthorizationToken = () => {
  removeAccessToken(AUTHORIZATION_KEY);
};

export const setAuthorizationToken = (token?: string) => {
  if (token) {
    setAccessToken(AUTHORIZATION_KEY, token);
  }
};

export const getAuthorizationToken = (): string | null => {
  return getAccessToken(AUTHORIZATION_KEY);
};
