<template>
  <div class="content">
    <a-result class="result" status="500">
      <template #icon>
        <a-spin dot />
      </template>
    </a-result>
  </div>
</template>

<style scoped lang="less">
  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -95px;
    margin-top: -121px;
    text-align: center;
  }
</style>
