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
      :placeholder="$t('plugin.webspeed.form.inputHost.placeholder')"
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
        @click.stop="handleQuickTest('quick')"
        >{{ $t('plugin.webspeed.form.button.singleTest') }}</a-button
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
  import validator from 'validator';
  import { useI18n } from 'vue-i18n';

  import {
    pingHistory,
    inputHost,
    inputDisable,
    filteredHistory,
    handlePingHistory,
    removeHistory,
  } from '../api/webspeed/history';

  import socketio, {
    requestSocket,
    RequestSocketData,
  } from '../api/webspeed/socketio';

  import { singleTaskLoading, updateTaskLoadingState } from '../api/node/node';

  const { t } = useI18n();
  const modalVisible = ref(false);

  const emit = defineEmits(['resetNodelist', 'changeHandletype']);
  const modalText = ref('');
  const handleType = ref('quick');

  const requestSocketData = ref<RequestSocketData>();
  const handleQuickTest = async (type: string) => {
    const host = inputHost.value;
    handleType.value = type;
    if (
      !validator.isIP(host, 4) &&
      !validator.isIP(host, 6) &&
      !validator.isFQDN(host) &&
      !validator.isURL(host)
    ) {
      modalText.value = t('plugin.webspeed.form.modal.invalidIP');
      modalVisible.value = true;
    } else {
      const locale = localStorage.getItem('arco-locale') || 'zh-CN';
      const dictCode = '';
      const dictValue = '';
      const socketParams = {
        client_type: 'web',
        content: inputHost.value,
        type,
        locale,
      };
      await requestSocket(socketParams)
        .then((response: RequestSocketData) => {
          requestSocketData.value = response;
          inputDisable.value = true;
          emit(
            'changeHandletype',
            type,
            response.node_type,
            dictCode,
            dictValue,
            response.task_id
          );
          emit('resetNodelist');
        })
        .catch((error) => {
          console.error('requestSocket Error:', error);
        });
        updateTaskLoadingState()
    }
  };
  const createSocketIO = () => {
    socketio(requestSocketData.value)
      .then(({ sendMessage }) => {
        const msg = `{"taskType":"webspeed","taskId":"${requestSocketData.value.task_id}"}`;
        pingHistory.addItem(inputHost.value);
        sendMessage('web-task', msg);
      })
      .catch(() => {
        modalText.value = t('plugin.webspeed.form.modal.apiError');
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
