<template>
  <div class="loading"></div>
</template>

<script setup></script>

<style scoped>
  .loading {
    position: relative;
    width: 30px;
    height: 30px;
    border: 2px solid #000;
    border-top-color: rgba(0, 0, 0, 0.2);
    border-right-color: rgba(0, 0, 0, 0.2);
    border-bottom-color: rgba(0, 0, 0, 0.2);
    border-radius: 100%;

    animation: circle infinite 0.75s linear;
  }

  @keyframes circle {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
