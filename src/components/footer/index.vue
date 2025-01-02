<template>
  <!-- <a-layout-footer> -->
  <div class="footer">
    <div class="footer-content">
      <div class="footer-text">
        <a-space>
          <a-typography-text
            v-if="siteConfig.site_copyright"
            type="secondary"
            >{{ siteConfig.site_copyright }}</a-typography-text
          >
          <a-link
            v-if="siteConfig.site_record_number"
            href="https://beian.miit.gov.cn/"
            target="_blank"
            type="secondary"
            class="footer-link"
            >{{ siteConfig.site_record_number }}</a-link
          >
        </a-space>
      </div>
      <div class="footer-icons">
        <a-space>
          <a-button shape="circle" @click="openGitHub">
            <template #icon><icon-github /></template>
          </a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import useSiteConfigStore from '@/store/modules/config';
  import { IconGithub } from '@arco-design/web-vue/es/icon';

  const openGitHub = () => {
    window.open('https://github.com/AdmUU/Admin.IM', '_blank');
  };

  const siteConfig = useSiteConfigStore();
</script>

<style lang="less" scoped>
  .footer {
    background-color: var(--color-bg-2);
    padding: 0 16px;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    max-width: 1300px;
    margin: 0 auto;
  }

  .footer-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .footer-icons {
    flex-shrink: 0;
    margin-left: 16px;
  }
  :deep(.footer-link) {
    color: var(--color-text-3);
    text-decoration: none;
  }

  :deep(.footer-link):hover {
    color: var(--color-text-2);
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .footer-text {
      font-size: 12px;
    }

    .footer-icons :deep(.arco-btn) {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }
  }
</style>
