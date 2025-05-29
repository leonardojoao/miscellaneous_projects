import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthType } from '../../modules/login/types/AuthType';
import { ProductRoutesEnum } from '../../modules/product/routes';
import { ERROR_MESSAGE } from '../constants/statusError';
import { SUCCESS_MESSAGE } from '../constants/statusSuccess';
import { API_URL_AUTH } from '../constants/urls';
import { setAuthorizationToken } from '../functions/connection/auth';
import connectionAPI from '../functions/connection/connectionAPI';
import { useGlobalContext } from './useGlobalContext';

export const useRequests = () => {
  const { setNotification, setUser } = useGlobalContext();
  const navigator = useNavigate();

  const [loading, setLoading] = useState(false);

  const authRequest = async (body: unknown): Promise<void> => {
    setLoading(true);

    await connectionAPI
      .post<AuthType>(API_URL_AUTH, body)
      .then((result) => {
        setUser(result.user);
        setAuthorizationToken(result.accessToken);
        setNotification(SUCCESS_MESSAGE.LOGIN, 'success', '');
        navigator(ProductRoutesEnum.PRODUCT);
      })
      .catch((error) => {
        setNotification(ERROR_MESSAGE.INVALID_CREDENTIALS, 'error', '');
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getRequest = async (url: string) => {
    setLoading(true);

    return await axios({
      method: 'get',
      url: url,
    })
      .then((result) => {
        return result.data;
      })
      .catch(() => {
        alert('Erro');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const postRequest = async <T>(url: string, body: unknown): Promise<T> => {
    setLoading(true);

    const returnData = await connectionAPI
      .post(url, body)
      .then((result) => {
        return result as T;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });

    return returnData;
  };

  return {
    loading,
    authRequest,
    getRequest,
    postRequest,
  };
};
