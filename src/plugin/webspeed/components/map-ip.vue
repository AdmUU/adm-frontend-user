<template>
  <div class="map-ip-port-line" style="">
    <a-space>
      <a-tag size="large" color="gray" style="padding: 10px 32px 10px 14px"
        >{{ t('plugin.ping.node.table.title.responseIP') }}：
        <a-popover
          :content-style="{ padding: '0 10px' }"
          :popup-visible="responseIPPopupVisible"
        >
          <a-badge :count="responseIPCount" :max-count="99" :offset="[16, 4]">
            {{ responseFirstIP }}
          </a-badge>

          <template #content>
            <div
              class="ip-list-container"
              style="padding: 5px 5px 0 5px; text-align: center"
            >
              <div v-show="responseIPv4.length">
                <a-divider style="margin: 20px 0 20px 0">
                  <a-avatar
                    class="map-ip-port-line-avatar"
                    :size="26"
                    shape="square"
                    >IPv4</a-avatar
                  >
                </a-divider>
                <div style="margin: 0 0 10px 0">
                  <a-list :bordered="false" :split="false">
                    <a-list-item
                      v-for="item in responseIPv4"
                      :key="item.key"
                      style="padding: 4px 0"
                    >
                      <a-tag color="gray">{{ item }}</a-tag>
                    </a-list-item>
                  </a-list>
                </div>
              </div>
              <div v-show="responseIPv6.length">
                <a-divider style="margin: 20px 0 20px 0">
                  <a-avatar
                    class="map-ip-port-line-avatar"
                    :size="26"
                    shape="square"
                    :style="{
                      backgroundColor: '#0FBF60',
                    }"
                    >IPv6</a-avatar
                  >
                </a-divider>
                <div style="margin: 0 0 10px 0">
                  <a-list :bordered="false" :split="false">
                    <a-list-item
                      v-for="item in responseIPv6"
                      :key="item.key"
                      style="padding: 4px 0"
                    >
                      <a-tag color="gray">
                        {{ item }}
                      </a-tag>
                    </a-list-item>
                  </a-list>
                </div>
              </div>
            </div>
          </template>
        </a-popover></a-tag
      >
      <a-tag
        v-if="responsePort"
        size="large"
        color="gray"
        style="padding: 10px 2px 10px 2px"
        >{{ t('plugin.ping.node.table.title.responsePort') }}：{{
          responsePort
        }}</a-tag
      >
    </a-space>
  </div>
</template>

<script lang="ts" setup>
  import { ref, PropType } from 'vue';
  import i18n from '@/locale';
  import { ResponseIPs } from '../api/webspeed/socketio';

  const { t } = i18n.global;
  const responseFirstIP = ref('');
  const responsePort = ref(0);
  const responseIPCount = ref(0);
  const responseIPPopupVisible = ref(false);
  const responseIPv4 = ref([]);
  const responseIPv6 = ref([]);
  const props = defineProps({
    responseIps: {
      type: Object as PropType<ResponseIPs>,
      required: true,
      default: () => ({
        all: [],
        ipv4: [],
        ipv6: [],
        port: null,
      }),
    },
  });
  if (props.responseIps.all.length > 0) {
    [responseFirstIP.value] = props.responseIps.all;
    if (props.responseIps.port) {
      responsePort.value = props.responseIps.port;
    }
    if (props.responseIps.all.length > 1) {
      responseIPCount.value = props.responseIps.all.length;
      responseIPPopupVisible.value = null;
    }
    if (props.responseIps.ipv4.length > 1) {
      responseIPv4.value = props.responseIps.ipv4;
    }
    if (props.responseIps.ipv6.length > 0) {
      responseIPv6.value = props.responseIps.ipv6;
    }
  }
</script>

<style lang="less" scoped>
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
