<!-- eslint-disable vue/no-v-html -->
<template>
  <a-alert
    v-if="noticeList.length > 0"
    type="info"
    :show-icon="false"
    banner
    closable
    @click="noticeClick(currentIndex)"
    >{{ currentNotice.title }}
  </a-alert>
  <a-modal
    v-model:visible="modalVisible"
    draggable
    hide-cancel
    @ok="handleModalOk"
    @cancel="handleModalCancel"
  >
    <template #title> {{ $t('navbar.alert.title') }} </template>
    <div v-html="modalText.content"></div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { onUnmounted, ref } from 'vue';
  import { NoticeRecord, NoticeListType, queryNoticeList } from '@/api/notice';

  const modalVisible = ref(false);
  const modalText = ref({
    title: 'Notice',
    content: '',
  });
  const noticeList = ref<NoticeListType>([]);
  const currentIndex = ref(0);
  const currentNotice = ref<NoticeRecord>({
    id: 0,
    title: '',
    content: '',
  });
  let noticeInterval: number;
  const rotateNotice = () => {
    currentIndex.value = (currentIndex.value + 1) % noticeList.value.length;
    currentNotice.value = noticeList.value[currentIndex.value];
  };
  queryNoticeList().then((data) => {
    noticeList.value = data;
    currentNotice.value = noticeList.value[currentIndex.value];
    if (data.length > 1) {
      noticeInterval = setInterval(rotateNotice, 5000);
    }
  });
  const noticeClick = (index: number) => {
    modalText.value.title = noticeList.value[index].title;
    modalText.value.content = noticeList.value[index].content;
    modalVisible.value = true;
  };
  const handleModalOk = () => {
    modalVisible.value = false;
  };
  const handleModalCancel = () => {
    modalVisible.value = false;
  };
  onUnmounted(() => {
    clearInterval(noticeInterval);
  });
</script>

<style scoped lang="less"></style>
