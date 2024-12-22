import axios from 'axios'

export const systemApi = {
  // 获取系统设置
  getSettings: () => axios.get('/api/admin/settings'),
  
  // 上传Logo
  uploadLogo: (formData) => {
    return axios.post('/api/admin/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 更新页面标题
  updateTitle: (title) => axios.post('/api/admin/settings/title', { title }),
  
  // 更新API设置
  updateApi: (apiKey, apiEndpoint) => 
    axios.post('/api/admin/settings/api', { apiKey, apiEndpoint }),
  
  // 测试API连接
  testApi: (apiKey, apiEndpoint) => 
    axios.post('/api/admin/settings/test-api', { apiKey, apiEndpoint }),
  
  // 检查数据库状态
  checkDbStatus: () => axios.get('/api/health'),
  
  // 更新数据库配置
  updateDbConfig: (url) => axios.post('/api/admin/settings/database', { url }),
  
  // 获取会员设置
  getMembershipSettings: () => axios.get('/api/admin/settings/membership'),
  
  // 更新会员方案
  updateMembershipPlans: (plans) => 
    axios.post('/api/admin/settings/membership/plans', { plans }),
  
  // 更新支付配置
  updatePaymentConfig: (config) => 
    axios.post('/api/admin/settings/membership/payment', config)
} 