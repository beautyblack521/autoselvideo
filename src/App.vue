<template>
  <v-app>
    <Header />
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'
import { systemApi } from '@/api/system'
import Header from '@/components/layout/Header.vue'

const systemSettings = ref({
  logo: '/logo.svg',
  title: '自媒体视频脚本Ai自动生成系统'
})

// 提供给所有子组件使用
provide('systemSettings', systemSettings)

// 获取系统设置
const fetchSystemSettings = async () => {
  try {
    const response = await systemApi.getSettings()
    if (response.data) {
      systemSettings.value = {
        logo: response.data.logo || '/logo.svg',
        title: response.data.title || '自媒体视频脚本Ai自动生成系统'
      }
    }
  } catch (error) {
    console.error('获取系统设置失败:', error)
    // 使用默认值
    systemSettings.value = {
      logo: '/logo.svg',
      title: '自媒体视频脚本Ai自动生成系统'
    }
  }
}

// 添加更新系统设置的方法
const updateSystemSettings = (newSettings) => {
  systemSettings.value = { ...systemSettings.value, ...newSettings }
}

// 提供更新方法给子组件
provide('updateSystemSettings', updateSystemSettings)

onMounted(() => {
  fetchSystemSettings()
})
</script>

<style>
:root {
  --primary-color: #94A3B8;
  --secondary-color: #CBD5E1;
  --accent-color: #64748B;
  --background-color: #F8FAFC;
  --text-color: #334155;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: var(--background-color);
  color: var(--text-color);
}

.v-application {
  background-color: var(--background-color) !important;
}
</style>
