import axios from 'axios';
import { useState } from 'react';

interface PostRequestBody {
  email: string;
  password: string;
}

const useResquests = () => {
  const [loading, setLoading] = useState(false);

  const getRequest = async (url: string) => {
    setLoading(true);

    return await axios({
      method: 'get',
      url: url,
    })
      .then((response) => {
        setLoading(false);
        return response.data;
      })
      .catch((error) => {
        setLoading(false);
        alert('Error');
        return error;
      });
  };

  const postRequest = async (url: string, body: PostRequestBody) => {
    setLoading(true);

    return await axios({
      method: 'post',
      url: url,
      data: body,
    })
      .then((response) => {
        setLoading(false);
        return response.data;
      })
      .catch((error) => {
        setLoading(false);
        alert('Error');
        return error;
      });
  };

  return { loading, getRequest, postRequest };
};

export default useResquests;
