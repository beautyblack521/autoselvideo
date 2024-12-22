<template>
  <v-app>
    <!-- 连接状态提示 -->
    <v-system-bar
      v-if="!wsConnected"
      color="error"
      height="30"
    >
      <v-icon icon="mdi-wifi-off" class="mr-2"></v-icon>
      正在连接服务器...
      <v-btn
        variant="text"
        size="small"
        class="ml-2"
        @click="reconnectWebSocket"
      >
        重试
      </v-btn>
    </v-system-bar>

    <Header />
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted, watch } from 'vue'
import { systemApi } from '@/api/system'
import Header from '@/components/layout/Header.vue'
import { wsService } from '@/services/websocket'

const systemSettings = ref({
  logo: '/logo.svg',
  title: '自媒体视频脚本Ai自动生成系统'
})

const wsConnected = ref(false)

// 提供给所有子组件使用
provide('systemSettings', systemSettings)
provide('wsConnected', wsConnected)

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
  }
}

// 重新连接WebSocket
const reconnectWebSocket = async () => {
  try {
    await wsService.connect()
  } catch (error) {
    console.error('WebSocket reconnection failed:', error)
  }
}

// 监听WebSocket连接状态
watch(() => wsService.connected, (connected) => {
  wsConnected.value = connected
  console.log('WebSocket connection status:', connected)
})

onMounted(async () => {
  try {
    // 检查API连接
    await systemApi.checkDbStatus()
    console.log('API connection successful')
    
    // 初始化WebSocket连接
    await wsService.connect()
    wsConnected.value = true
  } catch (error) {
    console.error('Connection error:', error)
    wsConnected.value = false
  }

  // 获取系统设置
  await fetchSystemSettings()
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !wsService.connected) {
      reconnectWebSocket()
    }
  })
})

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('visibilitychange')
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

/* 添加连接状态栏样式 */
.v-system-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
</style>
