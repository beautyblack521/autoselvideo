import axios from 'axios'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  async error => {
    console.error('Response error:', error)
    
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('Network connection error')
      
      // 重试逻辑
      const retryCount = error.config.__retryCount || 0
      if (retryCount < 3) {
        error.config.__retryCount = retryCount + 1
        return service(error.config)
      }
    }
    
    // 处理401错误
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
    }
    
    return Promise.reject(error)
  }
)

export default service 