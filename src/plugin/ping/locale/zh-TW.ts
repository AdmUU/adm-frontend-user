export default {
  ping: {
    form: {
      button: {
        singleTest: '檢測一次',
        continuousTest: '持續檢測',
      },
      inputHost: {
        placeholder: '請輸入域名或IP',
      },
      modal: {
        invalidIP: '請輸入正確的IP地址或域名',
        apiError: '暫時無法完成您的請求，請稍後再試',
      },
    },
    node: {
      table: {
        title: {
          nodename: '節點',
          responseIP: '響應IP',
          responsePort: '端口',
          IPLocation: 'IP歸屬地',
          responseTime: '響應時間',
          responseTimeAvg: '平均響應',
          packetLoss: '丟包',
          packetMin: '最快',
          packetMax: '最慢',
          packetAvg: '平均',
          networkQuality: '網路品質',
          fastestRegion: '最快地區',
          slowestRegion: '最慢地區',
        },
        data: {
          timeout: '超時',
        },
      },
    },
    map: {
      locations: {
        world: '全球',
        china: '中國',
      },
      table: {
        title: {
          responseTimeAvg: '平均響應',
          responseTime: '響應時間',
          fastestRegion: '最快地區',
          slowestRegion: '最慢地區',
          fastestNode: '最快節點',
          slowestNode: '最慢節點',
          isp: '運營商',
          chinaTelecom: '中國電信',
          chinaUnicom: '中國聯通',
          chinaMobile: '中國移動',
          chinaBGP: '中國BGP',
        },
      },
    },
  },
};
