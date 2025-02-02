<template>
  <div class="layout-box layout-box-map">
    <div ref="chartRef" style="width: 50%; height: 500px"></div>
    <div style="width: 50%; height: 500px">
      <div title="chartData">
        <label>
          <input v-model="selectedMap" type="radio" value="world" /> 世界地图
        </label>
        <label>
          <input v-model="selectedMap" type="radio" value="china" /> 中国地图
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import * as echarts from 'echarts';
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import worldJson from '@/assets/data/world.json';
  import chinaJson from '@/assets/data/china.json';

  const chartRef = ref(null);
  let chart = null;
  const selectedMap = ref('world');

  echarts.registerMap('world', worldJson);
  echarts.registerMap('china', chinaJson);

  const updateChart = (mapType) => {
    const mapName = mapType === 'world' ? '世界地图' : '中国地图';
    const data =
      mapType === 'world'
        ? [
            { name: '中国', value: 300 },
            { name: 'United States', value: 180 },
            { name: 'Russia', value: 230 },
            { name: 'Brazil', value: 120 },
            { name: 'Australia', value: 80 },
          ]
        : [
            { name: '北京', value: 300 },
            { name: '上海', value: 180 },
            { name: '广东', value: 230 },
            { name: '浙江', value: 120 },
            { name: '江苏', value: 80 },
          ];

    const option = {
      title: {
        text: mapName,
        left: 'left',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}ms',
      },
      visualMap: {
        show: true,
        orient: 'vertical',
        left: '5%',
        bottom: '5%',
        pieces: [
          { min: 251, label: '超时', color: 'red' },
          { min: 201, max: 250, label: '201ms-250ms', color: 'orange' },
          { min: 151, max: 200, label: '151ms-200ms', color: 'yellow' },
          { max: 150, label: '≤150ms', color: 'lightgreen' },
        ],
        textStyle: {
          color: '#333',
        },
      },
      series: [
        {
          name: mapName,
          type: 'map',
          map: mapType,
          roam: false,
          data, // 使用属性简写
          label: {
            show: false,
          },
          itemStyle: {
            borderColor: '#D6E2E7',
            borderWidth: 1,
            areaColor: '#f2f5f5',
          },
          emphasis: {
            label: {
              show: true,
            },
            itemStyle: {
              areaColor: '#ADD8E6',
            },
          },
          layoutCenter: mapType === 'world' ? ['50%', '50%'] : undefined,
          layoutSize: mapType === 'world' ? '120%' : undefined,
        },
      ],
    };

    chart.setOption(option);
  };

  const initChart = () => {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value);
      updateChart(selectedMap.value);
    }
  };

  watch(selectedMap, (newValue) => {
    updateChart(newValue);
  });

  const handleResize = () => {
    if (chart) {
      chart.resize();
    }
  };

  onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    if (chart) {
      chart.dispose();
    }
    window.removeEventListener('resize', handleResize);
  });
</script>

<style lang="less" scoped>
  .layout-box-map {
    display: flex;
    margin-top: 20px;
    height: 500px;
    min-height: 80px;
    justify-content: center;
    align-items: center;
    background-color: var(--color-bg-2);
    width: 1300px;
    margin-right: auto;
    margin-left: auto;
  }
</style>
