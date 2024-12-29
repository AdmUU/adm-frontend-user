import axios, { AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
// import { useUserStore } from '@/store';
import { setTokenKey, getToken, setToken } from '@/utils/auth';
import useApiCaptchaStore from '@/store/plugin/captcha';
import i18n from '@/locale';

const { t } = i18n.global;

export interface HttpResponse<T = unknown> {
  success: boolean;
  message: string;
  code: number;
  data: T;
}

if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const apiCaptcha = useApiCaptchaStore();
    config.params = config.params || {};
    if (
      apiCaptcha.visible &&
      config.url &&
      (apiCaptcha.urlSet.indexOf(config.url) !== -1 ||
        config.url === '/adm/v1/getSiteConfig')
    ) {
      if (apiCaptcha.props.captcha_id !== undefined) {
        config.params.captcha_type = apiCaptcha.props.captcha_type;
        config.params.captcha_id = apiCaptcha.props.captcha_id;
        config.params.captcha_key = apiCaptcha.props.captcha_key;
        apiCaptcha.reset();
      } else {
        return Promise.reject(new Error(t('captcha.verification.required')));
      }
    }
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    setTokenKey('token');
    const token = getToken();
    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    setTokenKey('xsrf-token');
    const xsrfToken = getToken();
    if (xsrfToken) {
      config.headers = config.headers ?? new AxiosHeaders();
      config.headers['X-CSRF-TOKEN'] = `${xsrfToken}`;
    }
    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  }
);
// add response interceptors
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    const header = response.headers;
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000 && res.code !== 200) {
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (
        [50008, 50012, 50014].includes(res.code) &&
        response.config.url !== '/api/user/info'
      ) {
        Modal.error({
          title: 'Confirm logout',
          content:
            'You have been logged out, you can cancel to stay on this page, or log in again',
          okText: 'Re-Login',
          async onOk() {
            // const userStore = useUserStore();

            // await userStore.logout();
            window.location.reload();
          },
        });
      }

      const apiCaptcha = useApiCaptchaStore();
      if ([20010].includes(res.code)) {
        apiCaptcha.visible = true;
        if (response.config.url !== undefined) {
          apiCaptcha.addUrl(response.config.url);
        }
      } else if (Date.now() - apiCaptcha.errMsgShowTime > 5000) {
        apiCaptcha.errMsgShowTime = Date.now();
        Message.error({
          content: res.message || 'Error',
          duration: 5 * 1000,
        });
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }
    if (header['set-xsrf-token']) {
      setTokenKey('xsrf-token');
      setToken(header['set-xsrf-token']);
    }
    return res;
  },

  (error) => {
    const apiCaptcha = useApiCaptchaStore();
    if (Date.now() - apiCaptcha.errMsgShowTime > 5000) {
      apiCaptcha.errMsgShowTime = Date.now();
      Message.error({
        content: error.msg || error.message || 'Request Error',
        duration: 5 * 1000,
      });
    }
    return Promise.reject(error);
  }
);
