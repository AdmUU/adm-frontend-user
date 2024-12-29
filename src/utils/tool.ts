/* eslint-disable prettier/prettier */
import CryptoJS from 'crypto-js';

const tool = {
  md5: {},
  base64: {},
  aes: {},
  capsule: {},
};

const typeColor = (type = 'default') => {
  let color = '';
  switch (type) {
    case 'default':
      color = '#35495E';
      break;
    case 'primary':
      color = '#3488ff';
      break;
    case 'success':
      color = '#43B883';
      break;
    case 'warning':
      color = '#e6a23c';
      break;
    case 'danger':
      color = '#f56c6c';
      break;
    default:
      break;
  }
  return color;
};

tool.md5 = (str: string) => {
  return CryptoJS.MD5(str).toString();
};

tool.base64 = {
  encode(data: string) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));
  },
  decode(cipher: string) {
    return CryptoJS.enc.Base64.parse(cipher).toString(CryptoJS.enc.Utf8);
  },
};

tool.aes = {
  encode(data: string, secretKey: string) {
    const result = CryptoJS.AES.encrypt(
      data,
      CryptoJS.enc.Utf8.parse(secretKey),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return result.toString();
  },
  decode(cipher: string, secretKey: string) {
    const result = CryptoJS.AES.decrypt(
      cipher,
      CryptoJS.enc.Utf8.parse(secretKey),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return CryptoJS.enc.Utf8.stringify(result);
  },
};

tool.capsule = (title, info, type = 'primary') => {
  console.log(
    `%c ${title} %c ${info} %c`,
    'background:#35495E; padding: 1px; border-radius: 3px 0 0 3px; color: #fff;',
    `background:${typeColor(
      type
    )}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff;`,
    'background:transparent'
  );
};
export default tool;
