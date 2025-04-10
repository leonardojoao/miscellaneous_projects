import axios from 'axios';
import { useState } from 'react';

import connectionAPI from '../functions/connection/connectionAPI';

export const useRequests = () => {
  const [loading, setLoading] = useState(false);

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
    getRequest,
    postRequest,
  };
};
