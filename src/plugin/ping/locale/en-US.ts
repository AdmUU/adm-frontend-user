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
          responsePort: 'Port',
          IPLocation: 'IP Location',
          responseTime: 'Response Time',
          responseTimeAvg: 'Average Response',
          packetLoss: 'Packet Loss',
          packetMin: 'Min',
          packetMax: 'Max',
          packetAvg: 'Avg',
          networkQuality: 'Network Quality',
          fastestRegion: 'Fastest Region',
          slowestRegion: 'Slowest Region',
        },
        data: {
          timeout: 'Timeout',
        },
      },
    },
    map: {
      locations: {
        world: 'World',
        china: 'China',
      },
      table: {
        title: {
          responseTimeAvg: 'Response',
          responseTime: 'Time',
          fastestRegion: 'Fastest Region',
          slowestRegion: 'Slowest Region',
          fastestNode: 'Fastest Node',
          slowestNode: 'Slowest Node',
          isp: 'ISP',
          chinaTelecom: 'China Telecom',
          chinaUnicom: 'China Unicom',
          chinaMobile: 'China Mobile',
          chinaBGP: 'China BGP',
        },
      },
    },
  },
};
