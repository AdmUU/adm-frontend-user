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
            :columns="webSpeedColumns"
            :data="nodeList"
            :bordered="false"
            :pagination="false"
            :expandable="expandable"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed, reactive, h } from 'vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import { Spin } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import {
    nodeList,
    QueryNodeListParams,
    queryNodeList,
  } from '../api/node/node';

  const { t } = useI18n();

  const formatStatusCode = (code: string | null | undefined) => {
    if (code === null || code === undefined || code === '') {
      return '--';
    }
    if (code === '-1') {
      return `${t('plugin.webspeed.node.table.title.statusError')}`;
    }
    return `${code}`;
  };

  const formatIPLocation = (
    ip: string | null | undefined,
    location: string | null | undefined
  ) => {
    if (ip === null || ip === undefined || ip === '') {
      return '--';
    }
    if (location === null || location === undefined || location === '') {
      return ip;
    }
    return `${ip}(${location})`;
  };

  const formatNodeSeconds = (
    ms: number | string | null | undefined,
    decimals: number = 3
  ) => {
    if (ms === null || ms === undefined || ms === '' || ms === 0) {
      return '--';
    }
    const numValue = typeof ms === 'string' ? parseFloat(ms) : ms;
    if (Number.isNaN(numValue)) {
      return '--';
    }
    return `${(numValue / 1000).toFixed(decimals)}s`;
  };

  const formatBytes = (
    bytes: number | string | null | undefined,
    isSpeed: boolean = false
  ) => {
    if (bytes === null || bytes === undefined || bytes === '') {
      return '--';
    }

    const numValue = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
    if (Number.isNaN(numValue) || numValue < 0) {
      return '--';
    }

    if (numValue === 0) {
      return isSpeed ? '0 B/s' : '0 B';
    }

    const k = 1000;
    const baseSizes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const sizes = isSpeed ? baseSizes.map((size) => `${size}/s`) : baseSizes;

    const i = Math.floor(Math.log(numValue) / Math.log(k));
    const convertedValue = numValue / k ** i;

    let decimals: number;
    if (i === 0) {
      decimals = 0;
    } else if (convertedValue >= 100) {
      decimals = 0;
    } else {
      decimals = 1;
    }

    return `${convertedValue.toFixed(decimals)} ${sizes[i]}`;
  };

  const formatRedirects = (
    number: number | string | null | undefined,
    time: null
  ) => {
    if (number === null || number === undefined || number === '') {
      return '--';
    }
    if (time === null || time === undefined || time === 0) {
      return number;
    }
    const numValue = typeof time === 'string' ? parseFloat(time) : time;
    if (Number.isNaN(numValue)) {
      return number;
    }
    return `${number}${t('plugin.webspeed.node.table.data.numberOf')}(${(
      numValue / 1000
    ).toFixed(3)}s)`;
  };

  const expandable = reactive({
    title: '',
    width: 0,
  });

  const webSpeedColumns = computed<TableColumnData[]>(() => [
    {
      title: t('plugin.webspeed.node.table.title.nodename'),
      dataIndex: 'node_name',
      width: 170,
    },
    {
      title: t('plugin.webspeed.node.table.title.responseIP'),
      dataIndex: 'response_ip',
      width: 330,
      align: 'center',
      render: ({ record }) => {
        if (record.isLoadingIP) {
          return h(Spin, { size: 12 });
        }
        return formatIPLocation(
          record.response_ip,
          record.response_ip_location
        );
      },
    },
    {
      title: t('plugin.webspeed.node.table.title.statusCode'),
      dataIndex: 'status_code',
      width: 70,
      align: 'center',
      render: ({ record }) => formatStatusCode(record.status_code),
      bodyCellStyle: (record) => {
        if (record.status_code === '-1') {
          return {
            color: 'red',
          };
        }
        return {
          color: 'inherit',
        };
      },
    },
    {
      title: t('plugin.webspeed.node.table.title.timeConsuming'),
      dataIndex: 'response_time',
      width: 65,
      align: 'center',
      render: ({ record }) => formatNodeSeconds(record.response_time),
    },
    {
      title: t('plugin.webspeed.node.table.title.redirects'),
      dataIndex: 'redirects',
      width: 90,
      align: 'center',
      render: ({ record }) =>
        formatRedirects(record.redirects, record.redirect_time),
    },
    {
      title: t('plugin.webspeed.node.table.title.resolutionTime'),
      dataIndex: 'resolution_time',
      width: 65,
      align: 'center',
      render: ({ record }) => formatNodeSeconds(record.resolution_time),
    },
    {
      title: t('plugin.webspeed.node.table.title.connectionTime'),
      dataIndex: 'connection_time',
      width: 65,
      align: 'center',
      render: ({ record }) => formatNodeSeconds(record.connection_time),
    },
    {
      title: t('plugin.webspeed.node.table.title.sslHandshakeTime'),
      dataIndex: 'ssl_handshake_time',
      width: 65,
      align: 'center',
      render: ({ record }) => formatNodeSeconds(record.ssl_handshake_time),
    },
    {
      title: t('plugin.webspeed.node.table.title.downloadTime'),
      dataIndex: 'download_time',
      width: 65,
      align: 'center',
      render: ({ record }) => formatNodeSeconds(record.download_time),
    },
    {
      title: t('plugin.webspeed.node.table.title.downloadSize'),
      dataIndex: 'download_size',
      width: 70,
      align: 'center',
      render: ({ record }) => formatBytes(record.download_size),
    },
    {
      title: t('plugin.webspeed.node.table.title.downloadSpeed'),
      dataIndex: 'download_speed',
      width: 90,
      align: 'center',
      render: ({ record }) => formatBytes(record.download_speed, true),
    },
  ]);
  const props = defineProps({
    addressType: String,
    dictCode: String,
    dictValue: String,
    taskId: String,
  });
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
    queryNodeListParams.task_type = 'webspeed';
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
    align-items: center;
    height: 100%;
    width: auto;
    white-space: pre-wrap;
  }

  :deep(.arco-table-cell) {
    display: block;
  }
  .a-table__cell:nth-child(n + 2) {
    text-align: center;
  }
</style>
