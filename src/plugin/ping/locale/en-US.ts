export default {
  ping: {
    form: {
      button: {
        singleTest: 'Single Test',
        continuousTest: 'Continuous Test',
      },
      inputHost: {
        placeholder: 'Please enter the domain name or IP',
      },
      modal: {
        invalidIP: 'Please enter a valid IP address or domain name',
        apiError:
          'Your request cannot be completed at this time. Please try again later',
      },
    },
    node: {
      table: {
        title: {
          nodename: 'Node',
          responseIP: 'Response IP',
          IPLocation: 'IP Location',
          responseTime: 'Response Time',
          packetLoss: 'Loss',
          packetMin: 'Min',
          packetMax: 'Max',
          packetAvg: 'Avg',
          networkQuality: 'Network Quality',
        },
        data: {
          timeout: 'Timeout',
        },
      },
    },
  },
};
