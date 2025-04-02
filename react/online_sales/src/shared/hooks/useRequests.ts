import axios from 'axios';
import { useState } from 'react';

interface PostRequestBody {
  email: string;
  password: string;
}

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

  const postRequest = async (url: string, body: PostRequestBody) => {
    setLoading(true);

    const returnData = await axios({
      method: 'post',
      url: url,
      data: body,
    })
      .then(async (result) => {
        return result.data;
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
