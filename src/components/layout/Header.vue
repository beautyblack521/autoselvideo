<template>
  <v-app-bar flat class="px-4">
    <v-img
      :src="systemSettings.logo"
      :key="systemSettings.logo"
      max-width="48"
      min-width="48"
      height="48"
      contain
      class="mr-4 logo-image"
      alt="Logo"
      @error="handleLogoError"
    ></v-img>

    <v-spacer></v-spacer>

    <div class="d-flex align-center">
      <template v-if="!userStore.isLoggedIn">
        <v-btn
          variant="text"
          class="mr-2"
          @click="showLoginDialog = true"
        >
          <v-icon left>mdi-login</v-icon>
          登录
        </v-btn>
        
        <v-btn
          variant="outlined"
          color="primary"
          @click="showRegisterDialog = true"
        >
          <v-icon left>mdi-account-plus</v-icon>
          注册
        </v-btn>
      </template>
      
      <template v-else>
        <v-btn
          v-if="!isHomePage"
          color="primary"
          variant="text"
          class="mr-2"
          @click="goToHome"
        >
          <v-icon left>mdi-home</v-icon>
          返回首页
        </v-btn>

        <v-menu v-if="userStore.isAdmin" location="bottom end" offset="5">
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              variant="tonal"
              class="mr-2"
              v-bind="props"
            >
              <v-icon left>mdi-crown</v-icon>
              管理员
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list width="200" elevation="3" rounded="lg">
            <v-list-item
              @click="navigateToProfile"
              prepend-icon="mdi-account-circle"
            >
              <v-list-item-title>个人中心</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item
              @click="navigateToSystem"
              prepend-icon="mdi-cog"
            >
              <v-list-item-title>系统管理</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        
        <v-btn
          variant="text"
          @click="handleLogout"
        >
          <v-icon left>mdi-logout</v-icon>
          退出
        </v-btn>
      </template>
    </div>

    <!-- 登录对话框 -->
    <login-dialog
      v-model="showLoginDialog"
      @login-success="handleLoginSuccess"
    />

    <!-- 注册对话框 -->
    <register-dialog
      v-model="showRegisterDialog"
      @register-success="handleRegisterSuccess"
    />
  </v-app-bar>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LoginDialog from '../LoginDialog.vue'
import RegisterDialog from '../RegisterDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const systemSettings = inject('systemSettings')
const showLoginDialog = ref(false)
const showRegisterDialog = ref(false)

// 判断是否在首页
const isHomePage = computed(() => {
  return route.name === 'Home'
})

// 返回首页
const goToHome = () => {
  router.push('/')
}

const navigateToProfile = () => {
  router.push('/admin/profile')
}

// 添加系统管理导航方法
const navigateToSystem = () => {
  router.push('/admin/system')
}

const handleLoginSuccess = () => {
  showLoginDialog.value = false
}

const handleRegisterSuccess = () => {
  showRegisterDialog.value = false
}

const handleLogout = () => {
  userStore.logout()
  if (!isHomePage.value) {
    router.push('/')
  }
}

// 处理logo加载失败
const handleLogoError = (e) => {
  console.error('Logo load error:', e)
  e.target.src = '/logo.svg'
}
</script>

<style scoped>
.v-app-bar {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* 添加logo样式 */
.logo-image {
  border-radius: 8px;
  transition: transform 0.2s;
}

.logo-image:hover {
  transform: scale(1.05);
}

/* 添加菜单项悬停效果 */
.v-list-item {
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style> 