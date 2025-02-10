/* eslint-disable prettier/prettier */
import CryptoJS from 'crypto-js';
import i18n from '@/locale';

const { t } = i18n.global;

interface Tool {
  md5: (str: string) => string;
  base64: {
    encode: (data: string) => string;
    decode: (cipher: string) => string;
  };
  aes: {
    encode: (data: string, secretKey: string) => string;
    decode: (cipher: string, secretKey: string) => string;
  };
  capsule: (title: string, info: string, type?: string) => void;
  checkIP: (ip: string) => object;
  isValidIPv4: (ip: string) => boolean;
  isValidIPv6: (ip: string) => boolean;
  convertToNumber: (value) => number;
  formatDelay: (delay: number) => string;
  delayColor: (delay: number) => string;
}

const typeColor = (type = 'default'): string => {
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

const tool: Tool = {
  md5: (str: string): string => {
    return CryptoJS.MD5(str).toString();
  },

  base64: {
    encode(data: string): string {
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));
    },
    decode(cipher: string): string {
      return CryptoJS.enc.Base64.parse(cipher).toString(CryptoJS.enc.Utf8);
    },
  },

  aes: {
    encode(data: string, secretKey: string): string {
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
    decode(cipher: string, secretKey: string): string {
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
  },

  capsule: (title: string, info: string, type = 'primary'): void => {
    console.log(
      `%c ${title} %c ${info} %c`,
      'background:#35495E; padding: 1px; border-radius: 3px 0 0 3px; color: #fff;',
      `background:${typeColor(
        type
      )}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff;`,
      'background:transparent'
    );
  },

  checkIP: (ip) => {
    let result = {
      type: null,
      ip: null,
      port: null,
      isValid: false,
    };

    try {
      ip = ip.trim();

      if (!ip) {
        return result;
      }

      if (ip.includes('[') && ip.includes(']:')) {
        const matches = ip.match(/^\[(.*)\]:(\d+)$/);
        if (!matches) {
          return result;
        }

        const [, address, portStr] = matches;
        const port = parseInt(portStr, 10);

        if (tool.isValidIPv6(address)) {
          result = {
            type: 'IPv6',
            ip: address,
            port: null,
            isValid: true,
          };
          if (port > 1 && port <= 65535) {
            result.port = port;
          }

          return result;
        }
      } else if (tool.isValidIPv6(ip)) {
        return {
          type: 'IPv6',
          ip,
          port: null,
          isValid: true,
        };
      } else if (ip.includes(':')) {
        const parts = ip.split(':');
        if (parts.length !== 2) {
          return result;
        }

        const [address, portStr] = parts;
        const port = parseInt(portStr, 10);

        if (port < 1 || port > 65535) {
          return result;
        }

        if (tool.isValidIPv4(address)) {
          return {
            type: 'IPv4',
            ip: address,
            port,
            isValid: true,
          };
        }
      } else {
        const address = ip;

        if (tool.isValidIPv4(address)) {
          return {
            type: 'IPv4',
            ip: address,
            port: null,
            isValid: true,
          };
        }
      }

      return result;
    } catch {
      return result;
    }
  },

  isValidIPv4: (ip) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(ip)) {
      return false;
    }
    const parts = ip.split('.');
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  },

  isValidIPv6: (ip) => {
    ip = ip.replace(/^\[|\]$/g, '');

    const ipv6Regex =
      /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){2}::(?:[0-9a-fA-F]{1,4}:){0,3}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){3}::(?:[0-9a-fA-F]{1,4}:){0,2}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){4}::(?:[0-9a-fA-F]{1,4}:)?[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){5}::[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){6}:$|^(?:[0-9a-fA-F]{1,4}:){7}:$/;

    return ipv6Regex.test(ip);
  },

  convertToNumber: (value) => {
    const num = parseFloat(value);
    return Number.isNaN(num) ? 0 : num;
  },

  formatDelay: (delay: number): string => {
    if (typeof delay !== 'number' || Number.isNaN(delay)) {
      return '--';
    }
    if (delay <= 0 || delay > 5000)
      return t('plugin.ping.node.table.data.timeout');
    if (delay < 1) return '<1ms';
    return `${Math.round(delay)}ms`;
  },

  delayColor: (delay: number): string => {
    if (delay === 0) return '#e61500';
    if (delay > 250) return 'orange';
    if (delay > 200 && delay <= 250) return '#F7D100';
    if (delay > 100 && delay <= 200) return '#94DC1F';
    if (delay > 50 && delay <= 100) return 'LimeGreen';
    if (delay > 0 && delay <= 50) return '#0D9805';
    return '#e61500';
  },
};

export default tool;
