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
      <!-- 未登录状态 -->
      <template v-if="!userStore.isLoggedIn">
        <v-btn
          variant="text"
          class="mr-2"
          @click="showLoginDialog = true"
          :loading="isLoading"
        >
          <v-icon left>mdi-login</v-icon>
          登录
        </v-btn>
        
        <v-btn
          variant="outlined"
          color="primary"
          @click="showRegisterDialog = true"
          :loading="isLoading"
        >
          <v-icon left>mdi-account-plus</v-icon>
          注册
        </v-btn>
      </template>
      
      <!-- 已登录状态 -->
      <template v-else>
        <v-btn
          v-if="!isHomePage"
          color="primary"
          variant="text"
          class="mr-2"
          @click="goToHome"
        >
          <v-icon left>mdi-home</v-icon>
          首页
        </v-btn>

        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              variant="text"
              v-bind="props"
            >
              <v-icon left>mdi-account-circle</v-icon>
              {{ userStore.user?.name || '用户' }}
              <v-icon right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              v-if="userStore.isAdmin"
              prepend-icon="mdi-cog"
              title="系统设置"
              @click="goToSystemSettings"
            ></v-list-item>
            
            <v-list-item
              prepend-icon="mdi-account"
              title="个人中心"
              @click="goToProfile"
            ></v-list-item>
            
            <v-divider></v-divider>
            
            <v-list-item
              prepend-icon="mdi-logout"
              title="退出登录"
              @click="handleLogout"
            ></v-list-item>
          </v-list>
        </v-menu>
      </template>
    </div>

    <!-- 登录对话框 -->
    <LoginDialog
      v-model="showLoginDialog"
      @login-success="handleLoginSuccess"
    />

    <!-- 注册对话框 -->
    <RegisterDialog
      v-model="showRegisterDialog"
      @register-success="handleRegisterSuccess"
    />
  </v-app-bar>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LoginDialog from '@/components/LoginDialog.vue'
import RegisterDialog from '@/components/RegisterDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const systemSettings = inject('systemSettings')

const showLoginDialog = ref(false)
const showRegisterDialog = ref(false)
const isLoading = ref(false)

// 是否在首页
const isHomePage = computed(() => {
  return route.path === '/'
})

// 处理登录成功
const handleLoginSuccess = () => {
  showLoginDialog.value = false
}

// 处理注册成功
const handleRegisterSuccess = () => {
  showRegisterDialog.value = false
}

// 处理退出登录
const handleLogout = () => {
  userStore.logout()
  if (!isHomePage.value) {
    router.push('/')
  }
}

// 跳转到首页
const goToHome = () => {
  router.push('/')
}

// 跳转到个人中心
const goToProfile = () => {
  router.push('/profile')
}

// 跳转到系统设置
const goToSystemSettings = () => {
  router.push('/admin/system')
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