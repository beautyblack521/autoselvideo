import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'
import { wsService } from '@/services/websocket'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// 添加错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err)
  console.error('Error Info:', info)
}

// 初始化 WebSocket 连接
wsService.connect().catch(error => {
  console.error('WebSocket connection failed:', error)
})

// 初始化用户状态
const userStore = useUserStore(pinia)
userStore.initializeFromStorage()

app.mount('#app')
