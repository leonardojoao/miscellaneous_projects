import axios, { AxiosRequestConfig } from 'axios';

import { ERROR_MESSAGE, ERROR_STATUS } from '../../constants/statusError';
import { MethodsEnum } from '../../enums/methods.enums';
import { getAuthorizationToken } from './auth';

class ConnectionAPI {
  static async call<T>(url: string, method: MethodsEnum, body?: unknown): Promise<T> {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: getAuthorizationToken(),
        'Content-Type': 'application/json',
      },
    };

    switch (method) {
      case MethodsEnum.GET:
        return (await axios.get<T>(url, config)).data;
      case MethodsEnum.POST:
        return (await axios.post<T>(url, body, config)).data;
      case MethodsEnum.PATCH:
        return (await axios.patch<T>(url, body, config)).data;
      case MethodsEnum.PUT:
        return (await axios.put<T>(url, body, config)).data;
      case MethodsEnum.DELETE:
        return (await axios.delete<T>(url, config)).data;
      default:
        return (await axios.get<T>(url, config)).data;
    }
  }

  static async connect<T>(url: string, method: MethodsEnum, body?: unknown): Promise<T> {
    return await ConnectionAPI.call<T>(url, method, body).catch((error) => {
      if (error.response) {
        switch (error.response.status) {
          case ERROR_STATUS.UNAUTHORIZED:
            throw new Error(ERROR_MESSAGE.UNAUTHORIZED);
          case ERROR_STATUS.FORBIDDEN:
            throw new Error(ERROR_MESSAGE.FORBIDDEN);
          case ERROR_STATUS.NOT_FOUND:
            throw new Error(ERROR_MESSAGE.NOT_FOUND);
          case ERROR_STATUS.SERVER_ERROR:
            throw new Error(ERROR_MESSAGE.SERVER_ERROR);
          case ERROR_STATUS.BAD_GATEWAY:
            throw new Error(ERROR_MESSAGE.BAD_GATEWAY);
          case ERROR_STATUS.SERVICE_UNAVAILABLE:
            throw new Error(ERROR_MESSAGE.SERVICE_UNAVAILABLE);
          case ERROR_STATUS.GATEWAY_TIMEOUT:
            throw new Error(ERROR_MESSAGE.GATEWAY_TIMEOUT);
          default:
            throw new Error(`Error ${error.response.status}: ${error.response.data.message}`);
        }
      } else {
        throw new Error('Connection Error');
      }
    });
  }
}

const connectionAPIGet = async <T>(url: string): Promise<T> => {
  return await ConnectionAPI.connect<T>(url, MethodsEnum.GET);
};

const connectionAPIPost = async <T>(url: string, body: unknown): Promise<T> => {
  return await ConnectionAPI.connect<T>(url, MethodsEnum.POST, body);
};

const connectionAPIPatch = async <T>(url: string, body: unknown): Promise<T> => {
  return await ConnectionAPI.connect<T>(url, MethodsEnum.PATCH, body);
};

const connectionAPIPut = async <T>(url: string, body: unknown): Promise<T> => {
  return await ConnectionAPI.connect<T>(url, MethodsEnum.PUT, body);
};

const connectionAPIDelete = async <T>(url: string): Promise<T> => {
  return await ConnectionAPI.connect<T>(url, MethodsEnum.DELETE);
};

const connectionAPI = {
  get: connectionAPIGet,
  post: connectionAPIPost,
  patch: connectionAPIPatch,
  put: connectionAPIPut,
  delete: connectionAPIDelete,
};

export default connectionAPI;
