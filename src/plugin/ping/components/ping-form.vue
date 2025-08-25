<!--
 - This file is part of AdminIM.
 -
 - @link     https://www.admin.im
 - @github   https://github.com/51/admin.im
 - @contact  dev@admin.im
 - @license  https://github.com/51/admin.im/blob/master/LICENSE
-->
<template>
  <div class="layout-box-searchbar">
    <a-auto-complete
      :model-value="inputHost"
      :data="filteredHistory"
      :allow-clear="true"
      :style="{ width: '700px', height: '50px', marginRight: '20px' }"
      :placeholder="$t('plugin.ping.form.inputHost.placeholder')"
      @search="handlePingHistory"
      @select="handlePingHistory"
      @clear="handleClearInputHost"
      @focus="handleFocusInputHost"
    >
      <template #prefix>
        <icon-play-arrow />
      </template>

      <template #option="{ data }">
        <div class="history-option">
          <span>{{ data.raw.value }}</span>
          <a-button
            type="text"
            size="mini"
            @click.stop="removeHistory(data.raw.value)"
          >
            <icon-delete />
          </a-button>
        </div>
      </template>
    </a-auto-complete>
    <a-space>
      <a-button
        type="primary"
        shape="round"
        size="large"
        :loading="singleTaskLoading"
        @click.stop="handlePing(pingProtocol, 'single')"
        >{{ $t('plugin.ping.form.button.singleTest') }}</a-button
      >
      <a-button
        type="primary"
        shape="round"
        size="large"
        status="success"
        :loading="continuousTaskLoading"
        @click.stop="handlePing(pingProtocol, 'continuous')"
        >{{ $t('plugin.ping.form.button.continuousTest') }}</a-button
      >
    </a-space>
  </div>
  <a-modal
    v-model:visible="modalVisible"
    draggable
    hide-cancel
    @ok="handleModalOk"
    @cancel="handleModalCancel"
  >
    <template #title> {{ $t('modal.title') }}</template>
    <div>{{ modalText }}</div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import validator from 'validator';
  import { useI18n } from 'vue-i18n';

  import {
    pingHistory,
    inputHost,
    inputDisable,
    filteredHistory,
    handlePingHistory,
    removeHistory,
  } from '../api/ping/history';

  import socketio, {
    requestSocket,
    RequestSocketData,
  } from '../api/ping/socketio';

  import {
    updateNodeLoadingState,
    singleTaskLoading,
    continuousTaskLoading,
  } from '../api/node/node';

  const { t } = useI18n();
  const route = useRoute();
  const modalVisible = ref(false);
  const pingProtocol = ref('icmp');
  if (route.name === 'tcping') {
    pingProtocol.value = 'tcp';
  }
  // if (pingHistory.data.length > 0) {
  //   const [firstHistory] = pingHistory.data;
  //   inputHost.value = firstHistory;
  // }
  const emit = defineEmits(['resetNodelist', 'changePingtype']);
  const modalText = ref('');
  const handlePingType = ref('single');

  const requestSocketData = ref<RequestSocketData>();
  const handlePing = async (protocol: string, pingtype: string) => {
    const host = inputHost.value;
    handlePingType.value = pingtype;
    updateNodeLoadingState(true);
    if (pingtype === 'single') {
      singleTaskLoading.value = true;
    }
    if (pingtype === 'continuous') {
      continuousTaskLoading.value = true;
    }
    if (
      !validator.isIP(host, 4) &&
      !validator.isIP(host, 6) &&
      !validator.isFQDN(host) &&
      !validator.isURL(host)
    ) {
      modalText.value = t('plugin.ping.form.modal.invalidIP');
      modalVisible.value = true;
    } else {
      const locale = localStorage.getItem('arco-locale') || 'zh-CN';
      const dictCode = '';
      const dictValue = '';
      const socketParams = {
        client_type: 'web',
        ping_protocol: protocol,
        ping_type: pingtype,
        host: inputHost.value,
        locale,
      };
      await requestSocket(socketParams)
        .then((response: RequestSocketData) => {
          requestSocketData.value = response;
          inputDisable.value = true;
          emit(
            'changePingtype',
            pingtype,
            response.node_type,
            dictCode,
            dictValue,
            response.task_id
          );
          emit('resetNodelist');
        })
        .catch((error) => {
          console.error('requestSocket Error:', error);
          // modalText.value = t('plugin.ping.form.modal.apiError');
          // modalVisible.value = true;
        });
    }
  };
  const createSocketIO = () => {
    socketio(requestSocketData.value)
      .then(({ sendMessage }) => {
        const msg = `{"taskType":"ping","taskId":"${requestSocketData.value.task_id}"}`;

        pingHistory.addItem(inputHost.value);
        sendMessage('web-task', msg, handlePingType.value);
      })
      .catch(() => {
        modalText.value = t('plugin.ping.form.modal.apiError');
        modalVisible.value = true;
      });
  };
  const handleClearInputHost = () => {
    inputHost.value = '';
  };
  const handleFocusInputHost = () => {
    inputDisable.value = false;
  };
  const handleModalOk = () => {
    modalVisible.value = false;
  };
  const handleModalCancel = () => {
    modalVisible.value = false;
  };
  const foo = ref('foo');
  defineExpose({
    foo,
    createSocketIO,
  });
</script>

<style lang="less" scoped>
  .layout-box-searchbar {
    display: flex;
    margin-top: 20px;
    height: 80px;
    min-height: 80px;
    justify-content: center;
    align-items: center;
    background-color: var(--color-bg-2);

    width: 1300px;
    margin-right: auto;
    margin-left: auto;
  }

  .history-option {
    width: 680px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
