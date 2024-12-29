/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import tool from '@/utils/tool';
import axios from 'axios';
/**
 * 获取验证码
 * @returns
 */
const getCaptcha = (data) => {
  return axios.post('plugin/captcha/get_captcha', data);
};
const preVerify = (captchaId, data) => {
  data.captcha_id = captchaId;
  const fs = {};
  // 简单收集浏览器特征
  fs.webdriver = !!navigator.webdriver;
  fs.cdcFunction = !!window.document.$cdc_asdjflasutopfhvcZLmcfl_;
  fs.headlessChrome = navigator.userAgent.includes('HeadlessChrome');
  fs.seleniumIDE = !!window.document.SeleniumIDE;
  fs.webdriverEvaluate = typeof __webdriver_evaluate !== 'undefined';
  fs.driverEvaluate = typeof __driver_evaluate !== 'undefined';
  fs.seleniumEvaluate = typeof __selenium_evaluate !== 'undefined';
  fs.webdriverScriptFunction =
    typeof __webdriver_script_function !== 'undefined';
  fs.webdriverScriptFunc = typeof __webdriver_script_func !== 'undefined';

  data.t = btoa(
    btoa(JSON.stringify(fs)) + tool.md5(JSON.stringify(fs) + captchaId)
  );
  return axios.post('plugin/captcha/pre_verify', data);
};
export { getCaptcha, preVerify };
