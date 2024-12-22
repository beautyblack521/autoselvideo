<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">首页</h1>
        <div class="mb-4">
          <v-btn
            v-if="userRole === 'admin'"
            color="primary"
            class="mr-2"
            @click="handleSystemSettings"
          >
            系统设置
          </v-btn>
          
          <v-btn
            color="primary"
            @click="handleExecute"
          >
            执行
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserRole } from '../services/userService'

const userRole = ref(null)

const fetchUserRole = async () => {
  try {
    const userId = localStorage.getItem('userId')
    if (userId) {
      const role = await getUserRole(userId)
      userRole.value = role
    }
  } catch (error) {
    console.error('获取用户角色失败:', error)
  }
}

const handleSystemSettings = () => {
  console.log('打开系统设置')
}

const handleExecute = () => {
  console.log('执行操作')
}

onMounted(() => {
  fetchUserRole()
})
</script> 