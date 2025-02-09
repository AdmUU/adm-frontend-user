<template>
  <div class="layout-box layout-box-map">
    <div ref="chartRef" style="width: 60%; height: 500px"></div>
    <div class="chart-panel">
      <div class="radio-group-container">
        <a-space>
          <a-radio-group
            v-model:model-value="selectedMap"
            type="button"
            size="large"
          >
            <a-radio value="world">{{
              t('plugin.ping.map.locations.world')
            }}</a-radio>
            <a-radio
              v-show="siteConfig.enable_ping_china_map === 'true'"
              value="china"
              >{{ t('plugin.ping.map.locations.china') }}</a-radio
            >
          </a-radio-group>
        </a-space>
      </div>
      <div v-show="selectedMap === 'world'" class="tables-wrapper">
        <div class="carrier-table">
          <MapIP :response-ips="responseIPs" />
          <a-space class="map-two-node-line" size="large">
            <a-statistic
              :value="fastestNode.response_time"
              :title="$t('plugin.ping.map.table.title.fastestNode')"
              placeholder="-"
              :loading="true"
              :animation="true"
              :value-style="{
                color: tool.delayColor(fastestNode.response_time),
                fontSize: '44px',
                lineHeight: '35px',
              }"
            >
              <template #prefix>
                <span style="font-size: 24px; margin-right: 10px"
                  ><icon-thunderbolt /></span
              ></template>
              <template #suffix> ms</template>
              <template #extra>
                <span style="font-size: 16px; display: inline-block">{{
                  fastestNode.node_name
                }}</span></template
              >
            </a-statistic>
            <a-statistic
              :value="slowestNode.response_time"
              :title="$t('plugin.ping.map.table.title.slowestNode')"
              placeholder="-"
              :loading="true"
              :animation="true"
              :value-style="{
                color: tool.delayColor(slowestNode.response_time),
                fontSize: '44px',
                lineHeight: '35px',
              }"
            >
              <template #prefix>
                <span style="font-size: 24px; margin-right: 10px"
                  ><icon-schedule /></span
              ></template>
              <template #suffix> ms</template>
              <template #extra>
                <span style="font-size: 16px; display: inline-block">{{
                  slowestNode.node_name
                }}</span></template
              >
            </a-statistic>
          </a-space>
        </div>
        <div class="tables-container">
          <a-table
            :columns="fastestNodeColumns"
            :data="fastestNodeData"
            :pagination="false"
            :scroll="{ x: '100%' }"
          />
          <a-table
            :columns="slowestNodeColumns"
            :data="slowestNodeData"
            :pagination="false"
            :scroll="{ x: '100%' }"
          />
        </div>
      </div>
      <div
        v-show="selectedMap === 'china'"
        title="china"
        class="tables-wrapper"
      >
        <div class="carrier-table">
          <MapIP :response-ips="responseChinaIPs" />
          <a-table
            :columns="carrierColumns"
            :data="carrierData"
            :pagination="false"
            :scroll="{ x: '100%' }"
          />
        </div>
        <div class="tables-container">
          <a-table
            :columns="fastestChinaNodeColumns"
            :data="fastestChinaNodeData"
            :pagination="false"
            :scroll="{ x: '100%' }"
          />
          <a-table
            :columns="slowestChinaNodeColumns"
            :data="slowestChinaNodeData"
            :pagination="false"
            :scroll="{ x: '100%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import * as echarts from 'echarts';
  import { computed, onMounted, onUnmounted, ref, watch, reactive } from 'vue';
  import type {
    TableData,
    TableColumnData,
  } from '@arco-design/web-vue/es/table/interface';
  import worldJson from '@/assets/data/world.json';
  import chinaJson from '@/assets/data/china.json';
  import i18n from '@/locale';
  import tool from '@/utils/tool';
  import useSiteConfigStore from '@/store/modules/config';
  import MapIP from './map-ip.vue';
  import { NodeRecord, nodeList } from '../api/node/node';
  import { MapStatNodes } from '../api/map/statistics';
  import { responseIPValid, responseChinaIPValid } from '../api/ping/socketio';

  const { t } = i18n.global;
  const siteConfig = useSiteConfigStore();

  // Calculate map nodes
  const mapNodes = (
    nodeRecordList: NodeRecord[],
    mapType: 'country' | 'province' | 'isp'
  ) => {
    const mapStatNodes: MapStatNodes = [];
    nodeRecordList.forEach((nodeRecord) => {
      if (!nodeRecord[mapType]) return;
      if (!mapStatNodes.find((node) => node.name === nodeRecord[mapType])) {
        mapStatNodes.push({
          name: nodeRecord[mapType],
          name_en: nodeRecord[`${mapType}_en`],
          packet_min: 0,
          packet_max: 0,
          packet_avg: 0,
          list: [],
        });
      }
      nodeRecord.response_time = tool.convertToNumber(nodeRecord.response_time);
      mapStatNodes
        .find((node) => node.name === nodeRecord[mapType])
        .list.push(nodeRecord);
    });
    return mapStatNodes;
  };

  const calMapNodes = (mapStatNodes: MapStatNodes) => {
    mapStatNodes.forEach((value, key) => {
      mapStatNodes[key].list = value.list.sort((a, b) => {
        if (a.response_time === 0) {
          return 1;
        }
        if (b.response_time === 0) {
          return -1;
        }
        return a.response_time - b.response_time;
      });
      mapStatNodes[key].packet_min = mapStatNodes[key].list[0].response_time;
      mapStatNodes[key].packet_max =
        mapStatNodes[key].list[value.list.length - 1].response_time;
      const itemLen = value.list.filter(
        (item) => item.response_time > 0
      ).length;
      mapStatNodes[key].packet_avg =
        itemLen === 0
          ? 0
          : Number(
              (
                value.list.reduce((acc, curr) => acc + curr.response_time, 0) /
                itemLen
              ).toFixed(3)
            );
    });

    mapStatNodes.sort((a, b) => {
      if (a.packet_avg === 0) {
        return 1;
      }
      if (b.packet_avg === 0) {
        return -1;
      }
      return a.packet_avg - b.packet_avg;
    });
  };

  const getNodeDelay = (
    mapStatNodes: MapStatNodes,
    nameEn: string,
    packetKey: string
  ) => {
    const statNode = mapStatNodes.find((node) => node.name_en === nameEn);
    if (statNode) {
      return tool.formatDelay(statNode[packetKey]);
    }
    return '--';
  };
  const countryNodeList = mapNodes(nodeList.value, 'country');
  const ispNodeList = mapNodes(
    countryNodeList.find((node) => node.name_en === 'China').list,
    'isp'
  );
  const provinceNodeList = mapNodes(
    countryNodeList.find((node) => node.name_en === 'China').list,
    'province'
  );

  calMapNodes(countryNodeList);
  calMapNodes(ispNodeList);
  calMapNodes(provinceNodeList);

  // FastestNode and slowestNode
  const responseIPs = ref(responseIPValid.value);
  const responseChinaIPs = ref(responseChinaIPValid.value);
  const fastestNode = ref<NodeRecord>({ key: '', node_name: '', country: '' });
  const slowestNode = ref<NodeRecord>({ key: '', node_name: '', country: '' });

  const timeoutFirstNode = nodeList.value.find(
    (item) => item.response_time === 0
  );
  const validNodes = nodeList.value.filter((item) => item.response_time > 0);

  const minValidNode =
    validNodes.length > 0
      ? validNodes.reduce((min, curr) => {
          return curr.response_time < min.response_time ? curr : min;
        })
      : null;
  if (minValidNode) {
    fastestNode.value = minValidNode;
  }

  if (timeoutFirstNode) {
    slowestNode.value = { ...timeoutFirstNode };
    slowestNode.value.response_time = undefined;
  } else {
    const maxValidNode =
      validNodes.length > 0
        ? validNodes.reduce((max, curr) => {
            return curr.response_time > max.response_time ? curr : max;
          })
        : null;
    if (
      maxValidNode &&
      (!fastestNode.value || fastestNode.value.key !== maxValidNode.key)
    ) {
      slowestNode.value = maxValidNode;
    }
  }
  // Top country node list
  const getEstTopNodeLen = (
    estnodeList: MapStatNodes | NodeRecord[],
    timeKey: string,
    topNodeLimit: number
  ) => {
    const estnodeListLength = estnodeList.length;

    const halfEstNodeLen =
      Math.ceil(estnodeListLength / 2) > topNodeLimit
        ? topNodeLimit
        : Math.ceil(estnodeListLength / 2);

    const timeoutEstNodeIndex = estnodeList.findIndex(
      (item) => item[`${timeKey}`] === 0
    );

    let fastestEstNodeLen = halfEstNodeLen;
    let slowestEstNodeLen = halfEstNodeLen;

    if (timeoutEstNodeIndex === -1 && halfEstNodeLen * 2 > estnodeListLength) {
      slowestEstNodeLen = halfEstNodeLen - 1;
    }

    if (timeoutEstNodeIndex >= 0) {
      fastestEstNodeLen =
        halfEstNodeLen <= timeoutEstNodeIndex
          ? halfEstNodeLen
          : timeoutEstNodeIndex;
      const slowestEstNodeTmpIndex =
        estnodeListLength - timeoutEstNodeIndex < topNodeLimit
          ? estnodeListLength - timeoutEstNodeIndex
          : topNodeLimit;
      slowestEstNodeLen =
        halfEstNodeLen > slowestEstNodeTmpIndex
          ? halfEstNodeLen
          : slowestEstNodeTmpIndex;
    }
    return [fastestEstNodeLen, slowestEstNodeLen];
  };

  const fastestNodeData = ref();
  const slowestNodeData = ref();
  const [fastestCountryNodeLen, slowestCountryNodeLen] = getEstTopNodeLen(
    countryNodeList,
    'packet_avg',
    4
  );

  if (fastestCountryNodeLen > 0) {
    fastestNodeData.value = countryNodeList.slice(0, fastestCountryNodeLen);
  }

  if (slowestCountryNodeLen > 0) {
    slowestNodeData.value = countryNodeList
      .slice(-slowestCountryNodeLen)
      .reverse();
  }

  // Top node table definition
  const FASTEST_NODE_TABLE_WIDTH = 155;
  const NODE_NAME_WIDTH = Math.floor(FASTEST_NODE_TABLE_WIDTH * 0.6);
  const DELAY_WIDTH = Math.floor(FASTEST_NODE_TABLE_WIDTH * 0.4);

  const fastestNodeColumns = computed<TableColumnData[]>(() => [
    {
      title: t('plugin.ping.map.table.title.fastestRegion'),
      dataIndex: 'name',
      align: 'center',
      width: NODE_NAME_WIDTH,
    },
    {
      title: t('plugin.ping.map.table.title.responseTimeAvg'),
      dataIndex: 'packet_avg',
      width: DELAY_WIDTH,
      align: 'center',
      render: (data: { record: TableData }) => {
        if (data.record.packet_avg === undefined) return '--';
        return tool.formatDelay(data.record.packet_avg);
      },
    },
  ]);

  const slowestNodeColumns = computed<TableColumnData[]>(() => [
    {
      title: t('plugin.ping.map.table.title.slowestRegion'),
      dataIndex: 'name',
      align: 'center',
      width: NODE_NAME_WIDTH,
    },
    {
      title: t('plugin.ping.map.table.title.responseTimeAvg'),
      dataIndex: 'packet_avg',
      width: DELAY_WIDTH,
      align: 'center',
      render: (data: { record: TableData }) => {
        return tool.formatDelay(data.record.packet_avg);
      },
    },
  ]);

  const carrierColumns = computed<TableColumnData[]>(() => [
    {
      title: t('plugin.ping.map.table.title.isp'),
      dataIndex: 'carrier1',
      width: NODE_NAME_WIDTH,
      align: 'center',
    },
    {
      title: t('plugin.ping.map.table.title.responseTimeAvg'),
      dataIndex: 'delay1',
      width: DELAY_WIDTH,
      align: 'center',
    },
    {
      title: t('plugin.ping.map.table.title.isp'),
      dataIndex: 'carrier2',
      width: NODE_NAME_WIDTH,
      align: 'center',
    },
    {
      title: t('plugin.ping.map.table.title.responseTimeAvg'),
      dataIndex: 'delay2',
      width: DELAY_WIDTH,
      align: 'center',
    },
  ]);
  const carrierData = reactive([
    {
      carrier1: t('plugin.ping.map.table.title.chinaTelecom'),
      delay1: getNodeDelay(ispNodeList, 'China Telecom', 'packet_avg'),
      carrier2: t('plugin.ping.map.table.title.chinaUnicom'),
      delay2: getNodeDelay(ispNodeList, 'China Unicom', 'packet_avg'),
    },
    {
      carrier1: t('plugin.ping.map.table.title.chinaMobile'),
      delay1: getNodeDelay(ispNodeList, 'China Mobile', 'packet_avg'),
      carrier2: t('plugin.ping.map.table.title.chinaBGP'),
      delay2: getNodeDelay(ispNodeList, 'China BGP', 'packet_avg'),
    },
  ]);

  const fastestChinaNodeColumns = computed<TableColumnData[]>(() => [
    {
      title: t('plugin.ping.map.table.title.fastestNode'),
      dataIndex: 'node_name',
      align: 'center',
      width: NODE_NAME_WIDTH,
    },
    {
      title: t('plugin.ping.map.table.title.responseTime'),
      dataIndex: 'response_time',
      width: DELAY_WIDTH,
      align: 'center',
      render: (data: { record: TableData }) => {
        if (data.record.response_time === undefined) return '--';
        return tool.formatDelay(data.record.response_time);
      },
    },
  ]);

  const slowestChinaNodeColumns = computed<TableColumnData[]>(() => [
    {
      title: t('plugin.ping.map.table.title.slowestNode'),
      dataIndex: 'node_name',
      align: 'center',
      width: NODE_NAME_WIDTH,
    },
    {
      title: t('plugin.ping.map.table.title.responseTime'),
      dataIndex: 'response_time',
      width: DELAY_WIDTH,
      align: 'center',
      render: (data: { record: TableData }) => {
        if (data.record.response_time === undefined) return '--';
        return tool.formatDelay(data.record.response_time);
      },
    },
  ]);

  // Top CN node list
  const topCNNodeList = countryNodeList.find(
    (node) => node.name_en === 'China'
  ).list;

  const fastestChinaNodeData = ref();
  const slowestChinaNodeData = ref();
  const [fastestCNNodeLen, slowestCNNodeLen] = getEstTopNodeLen(
    topCNNodeList,
    'response_time',
    3
  );

  if (fastestCNNodeLen > 0) {
    fastestChinaNodeData.value = topCNNodeList.slice(0, fastestCNNodeLen);
  }

  if (slowestCNNodeLen > 0) {
    slowestChinaNodeData.value = topCNNodeList
      .slice(-slowestCNNodeLen)
      .reverse();
  }

  // Map chart definition
  const worldChartData = reactive(
    countryNodeList.map((node) => {
      return {
        name: node.name_en,
        nameCn: node.name,
        value: node.packet_avg,
        list: node.list,
      };
    })
  );

  const chinaChartData = reactive(
    provinceNodeList.map((node) => {
      return {
        name: node.name,
        nameCn: node.name,
        value: node.packet_min,
        list: node.list,
      };
    })
  );

  const chartRef = ref(null);
  let chart = null;
  const defaultaMap = 'world';
  const selectedMap = ref('world');

  const worldJsonData = worldJson as any;
  echarts.registerMap('world', worldJsonData);

  if (siteConfig.enable_ping_china_map === 'true') {
    const chinaJsonData = chinaJson as any;
    echarts.registerMap('china', chinaJsonData);
    if (defaultaMap !== 'world') {
      selectedMap.value = 'china';
    }
  }

  const updateChart = (mapType) => {
    const mapName = mapType === 'world' ? 'World' : 'China';
    const data = mapType === 'world' ? worldChartData : chinaChartData;

    const option = {
      tooltip: {
        trigger: 'item',
        position: 'top',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E2E2E2',
        borderWidth: 1,
        padding: 0,
        className: 'custom-tooltip',
        extraCssText: `
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      width: auto;
      min-width: 200px;
      max-width: 350px;
    `,
        formatter(params) {
          const { value } = params;
          if (!params.data || !params.data.list || params.data.list === 0) {
            return null;
          }
          const regionDelays = params.data.list || [];

          const header = `
        <div style="
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <span style="
            font-size: 18px;
            font-weight: 600;
            color: #333;
          ">${params.data.nameCn}</span>
          <div style="text-align: right;margin-left:20px;">
            <div style="
              font-size: 16px;
              font-weight: 500;
            ">${value ? `${tool.formatDelay(value)}` : '--'}</div>
          </div>
        </div>
      `;

          const regionList = regionDelays
            .map(
              (item) => `
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 4px 16px;
          font-size: 13px;
          color: #555;
        ">
          <span>${item.node_name}</span>
          <span style="color: #1a73e8; font-weight: 500;">
            ${tool.formatDelay(item.response_time)}
          </span>
        </div>
      `
            )
            .join('');

          return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
          ${header}
          <div style="height: 8px;"></div>
          <div style="
            max-height: 800px;
            padding-bottom:8px;
            overflow-y: auto;
          ">
            ${regionList}
          </div>
        </div>
      `;
        },
      },
      visualMap: {
        show: true,
        orient: 'vertical',
        left: '5%',
        bottom: '5%',
        inverse: true,
        pieces: [
          {
            min: 0,
            max: 0,
            label: t('plugin.ping.node.table.data.timeout'),
            color: '#e61500',
          },
          {
            min: 250,
            label: '>250ms',
            color: 'orange',
          },
          { min: 200, max: 250, label: '201ms-250ms', color: '#F7D100' },
          { min: 100, max: 200, label: '101ms-200ms', color: '#94DC1F' },
          { min: 50, max: 100, label: '51ms-100ms', color: 'LimeGreen' },
          { min: 0.001, max: 50, label: '≤50ms', color: '#24AA1D' },
        ],
        textStyle: {
          color: '#333',
        },
      },
      series: [
        {
          name: mapName,
          type: 'map',
          map: mapType,
          roam: false,
          data,
          label: {
            show: false,
          },
          itemStyle: {
            borderColor: '#D6E2E7',
            borderWidth: 1,
            areaColor: '#f2f5f5',
          },
          emphasis: {
            label: {
              show: true,
            },
            itemStyle: {
              areaColor: '#ADD8E6',
            },
          },
          layoutCenter: mapType === 'world' ? ['50%', '50%'] : undefined,
          layoutSize: mapType === 'world' ? '130%' : undefined,
        },
      ],
    };

    chart.setOption(option);
  };

  const initChart = () => {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value);
      updateChart(selectedMap.value);
    }
  };

  watch(selectedMap, (newValue) => {
    updateChart(newValue);
  });

  const handleResize = () => {
    if (chart) {
      chart.resize();
    }
  };

  onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    if (chart) {
      chart.dispose();
    }
    window.removeEventListener('resize', handleResize);
  });
</script>

<style lang="less" scoped>
  .layout-box-map {
    display: flex;
    margin-top: 20px;
    height: 500px;
    min-height: 80px;
    justify-content: center;
    align-items: center;
    background-color: var(--color-bg-2);
    width: 1300px;
    margin-right: auto;
    margin-left: auto;
  }

  .chart-panel {
    width: 40%;
    height: 500px;
    position: relative;
  }

  .radio-group-container {
    position: absolute;
    top: 15px;
    right: 15px;
    z-index: 1;
  }

  .tables-wrapper {
    display: flex;
    flex-direction: column;
    padding: 65px 15px 20px;
    height: 100%;
  }

  .carrier-table {
    margin-bottom: 20px;

    :deep(.arco-table) {
      width: 100%;

      .arco-table-td,
      .arco-table-th {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
      }
    }
  }

  .tables-container {
    display: flex;
    gap: 20px;

    :deep(.arco-table) {
      width: 50%;

      .arco-table-td,
      .arco-table-th {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
      }
    }
  }
  .map-ip-port-line {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 50px;
    margin: 0px 0 20px 0;
    background-color: #f2f3f5;
  }
  .map-ip-port-line-avatar {
    background-color: #168cff;
    padding: 0 20px;
    font-style: italic;
  }
  .map-two-node-line {
    width: 100%;
    padding: 0 12px;
    display: flex;
    justify-content: space-around;
  }
</style>
