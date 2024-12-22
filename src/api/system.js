import request from '@/utils/request'

export const systemApi = {
  // 获取系统设置
  getSettings: () => request({
    url: '/api/admin/settings',
    method: 'get'
  }),
  
  // 上传Logo
  uploadLogo: (formData) => {
    return request({
      url: '/api/admin/settings/logo',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
  },
  
  // 更新页面标题
  updateTitle: (title) => request({
    url: '/api/admin/settings/title',
    method: 'post',
    data: { title }
  }),
  
  // 更新API设置
  updateApi: (apiKey, apiEndpoint) => 
    request({
      url: '/api/admin/settings/api',
      method: 'post',
      data: { apiKey, apiEndpoint }
    }),
  
  // 测试API连接
  testApi: (apiKey, apiEndpoint) => 
    request({
      url: '/api/admin/settings/test-api',
      method: 'post',
      data: { apiKey, apiEndpoint }
    }),
  
  // 检查数据库状态
  checkDbStatus: () => request({
    url: '/api/health',
    method: 'get'
  }),
  
  // 更新数据库配置
  updateDbConfig: (url) => request({
    url: '/api/admin/settings/database',
    method: 'post',
    data: { url }
  }),
  
  // 获取会员设置
  getMembershipSettings: () => {
    return request({
      url: '/api/admin/settings/membership',
      method: 'get'
    })
  },
  
  // 更新会员方案
  updateMembershipPlans: (plans) => {
    return request({
      url: '/api/admin/settings/membership/plans',
      method: 'post',
      data: { plans }
    })
  },
  
  // 更新支付配置
  updatePaymentConfig: (config) => {
    return request({
      url: '/api/admin/settings/membership/payment',
      method: 'post',
      data: config
    })
  },
  
  // 获取用户内容记录
  getUserContents: (page = 1) => request({
    url: '/api/user/contents',
    method: 'get',
    params: { page }
  }),
  
  // 获取用户订单记录
  getUserOrders: (page = 1) => request({
    url: '/api/user/orders',
    method: 'get',
    params: { page }
  }),
  
  // 下载内容
  downloadContent: (contentId) => request({
    url: `/api/user/contents/${contentId}/download`,
    method: 'get',
    responseType: 'blob'
  }),
  
  // 更新用户资料
  updateUserProfile: (data) => request({
    url: '/api/user/profile',
    method: 'put',
    data
  })
} 