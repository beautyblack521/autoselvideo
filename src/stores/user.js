import { defineStore } from 'pinia'
import { wsService } from '@/services/websocket'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    user: null,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isMember: (state) => state.user?.role === 'member',
    userRole: (state) => state.user?.role
  },

  actions: {
    async login(phone, verificationCode) {
      try {
        const response = await wsService.send('login', {
          phone,
          verificationCode
        })

        if (response.success) {
          this.isLoggedIn = true
          this.user = response.data.user
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
        } else {
          throw new Error(response.error)
        }
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    async register(phone, verificationCode) {
      try {
        const response = await wsService.send('register', {
          phone,
          verificationCode
        })

        if (response.success) {
          this.isLoggedIn = true
          this.user = response.data.user
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
        } else {
          throw new Error(response.error)
        }
      } catch (error) {
        console.error('Register error:', error)
        throw error
      }
    },

    async sendVerificationCode(phone) {
      try {
        const response = await wsService.send('verify_code', { phone })
        if (!response.success) {
          throw new Error(response.error)
        }
      } catch (error) {
        console.error('Send verification code error:', error)
        throw error
      }
    },

    logout() {
      this.isLoggedIn = false
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    initializeFromStorage() {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        this.isLoggedIn = true
        this.user = JSON.parse(userData)
      }
    }
  }
}) 