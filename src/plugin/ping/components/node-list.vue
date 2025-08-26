<!--
 - This file is part of AdminIM.
 -
 - @link     https://www.admin.im
 - @github   https://github.com/51/admin.im
 - @contact  dev@admin.im
 - @license  https://github.com/51/admin.im/blob/master/LICENSE
-->
<template>
  <div class="layout-box layout-box-body">
    <a-row :gutter="20" :style="{ marginBottom: '20px', width: '1330px' }">
      <a-col :span="24">
        <a-card :bordered="false">
          <a-table
            v-if="pingType == 'single'"
            :columns="singlePingColumns"
            :data="nodeList"
            :bordered="false"
            :pagination="false"
          />
          <a-table
            v-if="pingType == 'continuous'"
            :columns="continuousPingColumns"
            :data="nodeList"
            :bordered="false"
            :pagination="false"
          >
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed, toRefs, h } from 'vue';
  import type {
    TableData,
    TableColumnData,
  } from '@arco-design/web-vue/es/table/interface';
  import { Spin } from '@arco-design/web-vue';
  import tool from '@/utils/tool';
  import { useI18n } from 'vue-i18n';
  import {
    pingChartWidth,
    pingChartHeight,
    initCanvas,
  } from '../api/node/canvas';
  import {
    nodeList,
    QueryNodeListParams,
    queryNodeList,
  } from '../api/node/node';

  const { t } = useI18n();
  const singlePingColumns = computed<TableColumnData[]>(() => [
    {
      title: t('plugin.ping.node.table.title.nodename'),
      dataIndex: 'node_name',
      width: 250,
    },
    {
      title: t('plugin.ping.node.table.title.responseIP'),
      dataIndex: 'response_ip',
      width: 350,
      align: 'center',
      render: (data: { record: TableData }) => {
        if (data.record.is_loading) {
          return h(Spin, { size: 12 });
        }
        return data.record.response_ip || '--';
      },
    },
    {
      title: t('plugin.ping.node.table.title.IPLocation'),
      dataIndex: 'response_ip_location',
      width: 400,
      align: 'center',
    },
    {
      title: t('plugin.ping.node.table.title.responseTime'),
      dataIndex: 'response_time',
      width: 200,
      align: 'center',
      render: (data: { record: TableData }) => {
        if (data.record.response_time === undefined) return '--';
        return tool.formatDelay(data.record.response_time);
      },
      bodyCellStyle: (record) => {
        if (record.response_time === 0) {
          return {
            color: 'red',
          };
        }
        return {
          color: 'inherit',
        };
      },
    },
  ]);

  const continuousPingColumns = computed<TableColumnData[]>(() => [
    {
      title: t('plugin.ping.node.table.title.nodename'),
      dataIndex: 'node_name',
      width: 250,
    },
    {
      title: t('plugin.ping.node.table.title.responseIP'),
      dataIndex: 'response_ip',
      width: 290,
      align: 'center',
      render: (data: { record: TableData }) => {
        if (data.record.is_loading) {
          return h(Spin, { size: 12 });
        }
        return data.record.response_ip || '--';
      },
    },
    {
      title: t('plugin.ping.node.table.title.IPLocation'),
      dataIndex: 'response_ip_location',
      width: 250,
      align: 'center',
    },
    {
      title: t('plugin.ping.node.table.title.packetLoss'),
      dataIndex: 'packet_loss',
      width: 70,
      align: 'center',
      bodyCellStyle: { 'text-align': 'center' },
      render: (data: { record: TableData }) => {
        if (data.record.packet_loss === undefined) return '--';
        return `${data.record.packet_loss}%`;
      },
    },
    {
      title: t('plugin.ping.node.table.title.packetMin'),
      dataIndex: 'packet_min',
      width: 70,
      align: 'center',
    },
    {
      title: t('plugin.ping.node.table.title.packetMax'),
      dataIndex: 'packet_max',
      width: 70,
      align: 'center',
    },
    {
      title: t('plugin.ping.node.table.title.packetAvg'),
      dataIndex: 'packet_avg',
      width: 70,
      align: 'center',
    },
    {
      title: t('plugin.ping.node.table.title.networkQuality'),
      dataIndex: 'network_quality',
      width: 200,
      align: 'center',
      slotName: 'pingchart1',
      render: (data: { record: TableData }) => {
        return h('canvas', {
          width: pingChartWidth,
          height: pingChartHeight,
          ref: (el) => {
            if (el) initCanvas(el as Element, data.record.key as string, -1);
          },
        });
      },
    },
  ]);

  const props = defineProps({
    pingType: String,
    addressType: String,
    dictCode: String,
    dictValue: String,
    taskId: String,
  });
  const { pingType } = toRefs(props);
  const emit = defineEmits(['queryComplete']);

  const queryNodeListParams: QueryNodeListParams = {};
  if (props.addressType) {
    queryNodeListParams.address_type = props.addressType;
  }
  if (props.dictCode) {
    queryNodeListParams.dict_code = props.dictCode;
  }
  if (props.dictValue) {
    queryNodeListParams.dict_value = props.dictValue;
  }
  if (props.taskId) {
    queryNodeListParams.task_type = 'ping';
    queryNodeListParams.task_id = props.taskId;
  }
  queryNodeList(queryNodeListParams).then(() => {
    emit('queryComplete');
  });
</script>

<style lang="less" scoped>
  .layout-box-body {
    margin-top: 20px;
  }

  :deep(.arco-card-size-medium) {
    .arco-card-body {
      padding: 0;
    }
  }
  :deep(.arco-table) {
    .arco-table-td {
      font-size: 12px;
    }
  }

  :deep(.arco-table-td-content) {
    // display: flex;
    align-items: center;
    height: 100%;
    width: auto;
  }

  :deep(.arco-table-cell) {
    display: block;
  }
  .a-table__cell:nth-child(n + 2) {
    text-align: center;
  }
</style>
