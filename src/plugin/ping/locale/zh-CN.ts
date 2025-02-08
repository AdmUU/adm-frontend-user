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
          responsePort: '端口',
          IPLocation: 'IP归属地',
          responseTime: '响应时间',
          responseTimeAvg: '平均响应',
          packetLoss: '丢包',
          packetMin: '最快',
          packetMax: '最慢',
          packetAvg: '平均',
          networkQuality: '网络质量',
          fastestRegion: '最快地区',
          slowestRegion: '最慢地区',
        },
        data: {
          timeout: '超时',
        },
      },
    },
    map: {
      locations: {
        world: '全球',
        china: '中国',
      },
      table: {
        title: {
          responseTimeAvg: '平均响应',
          responseTime: '响应时间',
          fastestRegion: '最快地区',
          slowestRegion: '最慢地区',
          fastestNode: '最快节点',
          slowestNode: '最慢节点',
          isp: '运营商',
          chinaTelecom: '中国电信',
          chinaUnicom: '中国联通',
          chinaMobile: '中国移动',
          chinaBGP: '中国BGP',
        },
      },
    },
  },
};
