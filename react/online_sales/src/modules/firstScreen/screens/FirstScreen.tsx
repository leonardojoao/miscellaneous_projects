import { Spin } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_URL_USER } from '../../../shared/constants/urls';
import {
  getAuthorizationToken,
  unsetAuthorizationToken,
} from '../../../shared/functions/connection/auth';
import connectionAPI from '../../../shared/functions/connection/connectionAPI';
import { LoginRoutesEnum } from '../../login/routes';
import { ProductRoutesEnum } from '../../product/routes';

const FirstScreen = () => {
  const navigate = useNavigate();

  const verifyToken = async () => {
    const token = getAuthorizationToken();

    if (token) {
      await connectionAPI
        .get(API_URL_USER)
        .then(() => {
          navigate(ProductRoutesEnum.PRODUCT);
        })
        .catch(() => {
          unsetAuthorizationToken();
          navigate(LoginRoutesEnum.LOGIN);
        });
    }
  };

  useEffect(() => {
    verifyToken();
  });

  return <Spin size="large" />;
};

export default FirstScreen;
