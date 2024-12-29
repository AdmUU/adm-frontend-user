export default {
  ping: {
    form: {
      button: {
        singleTest: '检测一次',
        continuousTest: '持续检测',
      },
      inputHost: {
        placeholder: '请输入域名或IP',
      },
      modal: {
        invalidIP: '请输入正确的IP地址或域名',
        apiError: '暂时无法完成您的请求,请稍后再试',
      },
    },
    node: {
      table: {
        title: {
          nodename: '节点',
          responseIP: '响应IP',
          IPLocation: 'IP归属地',
          responseTime: '响应时间',
          packetLoss: '丢包',
          packetMin: '最快',
          packetMax: '最慢',
          packetAvg: '平均',
          networkQuality: '网络质量',
        },
        data: {
          timeout: '超时',
        },
      },
    },
  },
};
