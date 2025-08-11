<!--
 - This file is part of AdminIM.
 -
 - @link     https://www.admin.im
 - @github   https://github.com/51/admin.im
 - @contact  dev@admin.im
 - @license  https://github.com/51/admin.im/blob/master/LICENSE
-->
<template>
  <div class="layout-body">
    <a-layout>
      <NavBar />
      <AlertBar />
      <MenuBar />
      <a-layout-content
        :style="{ justifyContent: 'flex-start', minHeight: '80vh' }"
      >
        <HandleForm
          ref="nodeListRef"
          @reset-nodelist="updateNodelist"
          @change-handletype="updateHandletype"
        />
        <HandleMap v-if="singleTaskEnd" />
        <NodeList
          :key="HandleFormKey"
          :handle-type="handleType"
          :address-type="addressType"
          :dict-code="dictCode"
          :dict-value="dictValue"
          :task-id="taskId"
          @query-complete="updateNodeListComplete"
        />
      </a-layout-content>
      <FooterLayout />
    </a-layout>
  </div>
  <captcha
    :type="apiCaptcha.props.captcha_type"
    :visible="apiCaptcha.visible"
    @close="handleCaptchaClose"
  ></captcha>
</template>

<script lang="tsx" setup>
  import { ref } from 'vue';
  import NavBar from '@/components/navbar/index.vue';
  import MenuBar from '@/components/navbar/menu.vue';
  import AlertBar from '@/components/navbar/alert.vue';
  import FooterLayout from '@/components/footer/index.vue';
  import captcha from '@/plugin/ljk123-captcha/components/captcha.vue';
  import useApiCaptchaStore from '@/store/plugin/captcha';
  import useSiteConfigStore from '@/store/modules/config';
  import { useRoute, useRouter } from 'vue-router';
  import { getSiteConfig } from '@/api/config';
  import HandleForm from '../components/form.vue';
  import HandleMap from '../components/map.vue';
  import NodeList from '../components/node-list.vue';
  import { singleTaskEnd } from '../api/webspeed/socketio';

  const route = useRoute();
  const router = useRouter();
  const handleType = ref('single');
  const addressType = ref('');
  const dictCode = ref('');
  const dictValue = ref('');
  const taskId = ref('');
  const HandleFormKey = ref(0);
  const apiCaptcha = useApiCaptchaStore();
  const siteConfig = useSiteConfigStore();
  const nodeListRef = ref(null);
  let resolveNodelist = null;

  function updateNodelist() {
    return new Promise((resolve) => {
      HandleFormKey.value += 1;
      resolveNodelist = resolve;
    });
  }

  function updateNodeListComplete() {
    if (resolveNodelist) {
      // showHandleMap.value = true;
      nodeListRef.value.createSocketIO();
    }
  }

  function updateHandletype(
    type: string,
    nodeType: string,
    handleDictCodea: string,
    handleDictValue: string,
    handleTaskId: string
  ) {
    handleType.value = type;
    addressType.value = nodeType;
    dictCode.value = handleDictCodea;
    dictValue.value = handleDictValue;
    taskId.value = handleTaskId;
  }

  function handleCaptchaClose(res: any) {
    if (res.validated) {
      apiCaptcha.props.captcha_key = res.formData.key;
      apiCaptcha.props.captcha_id = res.formData.captcha_id;
      getSiteConfig()
        .then(() => {
          router.go(0);
        })
        .catch((error) => {
          console.error('Site configuration error:', error);
          router.go(0);
        });
    }
  }

  function setPageTitleIcon() {
    const routeTitle = route.meta.title as string;
    document.title =
      routeTitle !== undefined
        ? `${routeTitle} - ${siteConfig.site_name} - ${siteConfig.site_subtitle}`
        : `${siteConfig.site_name} - ${siteConfig.site_subtitle}`;
    if (siteConfig.site_logo !== '') {
      const link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = siteConfig.site_logo;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }

  getSiteConfig().then((data) => {
    siteConfig.updateConfig(data);
    setPageTitleIcon();
  });
</script>

<style lang="less" scoped>
  .layout-body :deep(.arco-layout-header),
  .layout-body :deep(.arco-layout-footer),
  .layout-body :deep(.arco-layout-sider-children),
  .layout-body :deep(.arco-layout-content) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--color-black);
    font-size: 16px;
    font-stretch: condensed;
    text-align: center;
  }

  .layout-body :deep(.arco-layout-header),
  .layout-body :deep(.arco-layout-footer) {
    height: 64px;
    background-color: var(--color-bg-2);
  }

  .layout-box {
    display: flex;
    width: 1300px;
    margin-right: auto;
    margin-left: auto;
    &-body {
      margin-top: 20px;
    }
  }
  .logo {
    position: relative;
    display: inline-flex;
    align-items: center;

    &-text {
      margin-right: 4px;
      margin-left: 4px;
      color: var(--color-text-1);
      font-size: 16px;
    }
  }
  :deep(.arco-alert-info) {
    background-color: rgb(var(--blue-6));
    height: 32px;
    .arco-alert-body {
      display: flex;
      justify-content: center;
    }
    .arco-alert-content,
    .arco-alert-close-btn {
      font-size: 14px;
      color: #fff;
    }
    .arco-icon-hover:hover::before {
      background-color: rgb(var(--blue-5));
    }
  }
</style>
