<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent>
    <v-list-item
      prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
      :title="userStore.user?.username || '未登录'"
      :subtitle="getRoleText(userStore.userRole)"
    >
      <template v-slot:append>
        <v-btn
          variant="text"
          icon="mdi-chevron-left"
          @click.stop="rail = !rail"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <!-- 所有用户可见的菜单项 -->
      <v-list-item
        prepend-icon="mdi-home"
        title="首页"
        value="home"
        to="/"
      ></v-list-item>

      <!-- 仅管理员可见的菜单项 -->
      <template v-if="userStore.isAdmin">
        <v-list-item
          prepend-icon="mdi-account-group"
          title="用户管理"
          value="users"
          to="/admin/users"
        ></v-list-item>
        
        <v-list-item
          prepend-icon="mdi-shield-account"
          title="角色管理"
          value="roles"
          to="/admin/roles"
        ></v-list-item>
        
        <v-list-item
          prepend-icon="mdi-clipboard-text-clock"
          title="操作日志"
          value="logs"
          to="/admin/logs"
        ></v-list-item>
        
        <v-list-item
          prepend-icon="mdi-cog"
          title="系统设置"
          value="settings"
          to="/admin/settings"
        ></v-list-item>
      </template>

      <!-- 会员功能菜单项 -->
      <template v-if="userStore.isMember">
        <v-list-item
          prepend-icon="mdi-star"
          title="会员专区"
          value="vip"
          to="/member"
        ></v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const drawer = ref(true)
const rail = ref(false)

const getRoleText = (role) => {
  const roleMap = {
    'admin': '超级管理员',
    'member': '会员用户',
    'user': '普通用户'
  }
  return roleMap[role] || '访客'
}
</script> 