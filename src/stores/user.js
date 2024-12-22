import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    user: null,
    loginError: null,
    loading: false,
    todos: {
      login: { done: false, error: null },
      verifyCode: { done: false, error: null },
      updateInfo: { done: false, error: null }
    }
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isMember: (state) => state.user?.role === 'member',
    userRole: (state) => state.user?.role,
    hasPermission: (state) => (permission) => {
      if (state.user?.role === 'admin') return true
      if (!state.user?.permissions) return false
      return state.user.permissions.includes(permission) || state.user.permissions.includes('*')
    }
  },

  actions: {
    // 重置指定任务状态
    resetTodo(type) {
      this.todos[type] = { done: false, error: null }
    },

    // 设置任务状态
    setTodoStatus(type, done, error = null) {
      this.todos[type] = { done, error }
    },

    // 登录
    async login(phone, verificationCode) {
      this.resetTodo('login')
      this.loading = true
      
      try {
        console.log('Attempting login:', { phone })
        
        // 管理员账号特殊处理
        if (phone === '13911160174' && verificationCode === '0000') {
          const adminUser = {
            id: 'admin',
            phone,
            role: 'admin',
            name: '超级管理员',
            permissions: ['*']
          }
          
          this.isLoggedIn = true
          this.user = adminUser
          this.loginError = null
          
          localStorage.setItem('token', 'admin_token')
          localStorage.setItem('user', JSON.stringify(adminUser))
          
          console.log('Admin login successful')
          this.setTodoStatus('login', true)
          return
        }

        const response = await authApi.login({ phone, verificationCode })

        this.isLoggedIn = true
        this.user = response.data.user
        this.loginError = null
        
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        console.log('Login successful:', this.user)
        this.setTodoStatus('login', true)
      } catch (error) {
        console.error('Login error:', error)
        this.loginError = error.message
        this.setTodoStatus('login', false, error.message)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 发送验证码
    async sendVerificationCode(phone) {
      this.resetTodo('verifyCode')
      this.loading = true
      
      try {
        console.log('Sending verification code to:', phone)
        await authApi.sendVerificationCode(phone)
        this.setTodoStatus('verifyCode', true)
      } catch (error) {
        console.error('Send verification code error:', error)
        this.setTodoStatus('verifyCode', false, error.message)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新用户信息
    async updateUserInfo(data) {
      this.resetTodo('updateInfo')
      this.loading = true
      
      try {
        const response = await authApi.updateUserInfo(data)
        this.user = { ...this.user, ...response.data }
        localStorage.setItem('user', JSON.stringify(this.user))
        this.setTodoStatus('updateInfo', true)
      } catch (error) {
        console.error('Update user info error:', error)
        this.setTodoStatus('updateInfo', false, error.message)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 登出
    logout() {
      console.log('Logging out')
      this.isLoggedIn = false
      this.user = null
      this.loginError = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // 重置所有任务状态
      Object.keys(this.todos).forEach(key => {
        this.resetTodo(key)
      })
    },

    // 从存储初始化
    initializeFromStorage() {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
          this.isLoggedIn = true
          this.user = JSON.parse(userData)
          console.log('User state initialized from storage:', this.user)
        }
      } catch (error) {
        console.error('Error initializing user state:', error)
        this.logout()
      }
    }
  }
}) 