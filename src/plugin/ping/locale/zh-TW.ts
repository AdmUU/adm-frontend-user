export default {
  ping: {
    form: {
      button: {
        singleTest: '檢測一次',
        continuousTest: '持續檢測',
      },
      inputHost: {
        placeholder: '請輸入網域名稱或IP',
      },
      modal: {
        invalidIP: '請輸入正確的IP位址或域名',
        apiError: '無法與服務器建立連結，請檢查網絡或稍後重試',
      },
    },
    node: {
      table: {
        title: {
          nodename: '節點',
          responseIP: '回應IP',
          IPLocation: 'IP歸屬地',
          responseTime: '回應時間',
          packetLoss: '丟包',
          packetMin: '最快',
          packetMax: '最慢',
          packetAvg: '平均',
          networkQuality: '網路品質',
        },
        data: {
          timeout: '超時',
        },
      },
    },
  },
};
