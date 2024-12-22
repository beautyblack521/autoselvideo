import request from '@/utils/request'

export const authApi = {
  // 登录
  login: (data) => {
    return request({
      url: '/api/auth/login',
      method: 'post',
      data
    })
  },

  // 发送验证码
  sendVerificationCode: (phone) => {
    return request({
      url: '/api/auth/verify-code',
      method: 'post',
      data: { phone }
    })
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return request({
      url: '/api/auth/me',
      method: 'get'
    })
  },

  // 更新用户信息
  updateUserInfo: (data) => {
    return request({
      url: '/api/auth/update',
      method: 'put',
      data
    })
  }
} 