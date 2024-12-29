<template>
  <div class="menubar">
    <div class="layout-box-menubar">
      <a-menu
        mode="horizontal"
        :default-selected-keys="['ping']"
        :selected-keys="[route.meta.key]"
      >
        <a-menu-item
          v-for="item in menuList"
          :key="item.key"
          @click="goMenu(item.key)"
        >
          <a :href="item.key">
            <component :is="item.icon" style="margin-right: 5px" />
            {{ item.label }}
          </a>
        </a-menu-item>
      </a-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, toRaw } from 'vue';
  import type { Component } from 'vue';
  import { useRoute } from 'vue-router';
  import useMenuBarStore from '@/store/modules/menu-bar';

  const route = useRoute();
  interface MenuItem {
    key: string;
    label: string;
    icon: Component;
  }
  const menuBar = useMenuBarStore();
  const menuList = computed<MenuItem[]>(() => toRaw(menuBar.list));
  const goMenu = (key: string) => {
    window.location.href = `/${key}`;
  };
</script>

<style lang="less" scoped>
  .layout-box-menubar {
    display: flex;
    width: 1300px;
    margin-right: auto;
    margin-left: auto;
  }
  .menubar {
    width: 100%;
    height: auto;
    background-color: var(--color-menu-light-bg);
    cursor: 'text';
  }
</style>
