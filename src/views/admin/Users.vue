<template>
  <v-container class="py-4">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <h1 class="text-h5 font-weight-medium mb-0">用户管理</h1>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            prepend-icon="mdi-account-plus"
            @click="showCreateDialog = true"
          >
            添加用户
          </v-btn>
        </div>

        <!-- 用户列表 -->
        <v-card>
          <v-data-table
            :headers="headers"
            :items="users"
            :loading="loading"
            :items-per-page="10"
          >
            <!-- 用户状态 -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
              >
                {{ getStatusText(item.status) }}
              </v-chip>
            </template>

            <!-- 角色 -->
            <template v-slot:item.role="{ item }">
              <v-chip
                :color="getRoleColor(item.role)"
                size="small"
              >
                {{ getRoleText(item.role) }}
              </v-chip>
            </template>

            <!-- 操作按钮 -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                color="primary"
                @click="handleEdit(item)"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click="handleDelete(item)"
              ></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- 创建用户对话框 -->
    <UserDialog
      v-model="showCreateDialog"
      :roles="roles"
      @submit="handleCreate"
    />

    <!-- 编辑用户对话框 -->
    <UserDialog
      v-model="showEditDialog"
      :roles="roles"
      :user="selectedUser"
      @submit="handleUpdate"
    />

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">确认删除</v-card-title>
        <v-card-text>
          确定要删除用户 "{{ selectedUser?.username }}" 吗？此操作不可恢复。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            :loading="deleting"
            @click="confirmDelete"
          >
            删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import UserDialog from '@/components/admin/UserDialog.vue'

const userStore = useUserStore()

// 表格配置
const headers = [
  { title: '用户名', key: 'username', align: 'start' },
  { title: '邮箱', key: 'email', align: 'start' },
  { title: '角色', key: 'role', align: 'center' },
  { title: '状态', key: 'status', align: 'center' },
  { title: '创建时间', key: 'created_at', align: 'center' },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

// 数据状态
const users = ref([])
const roles = ref([])
const loading = ref(false)
const deleting = ref(false)

// 对话框状态
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedUser = ref(null)

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/users')
    users.value = await response.json()
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取角色列表
const fetchRoles = async () => {
  try {
    const response = await fetch('/api/v1/roles')
    roles.value = await response.json()
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 状态和角色显示
const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'warning',
    banned: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    active: '正常',
    inactive: '未激活',
    banned: '已禁用'
  }
  return texts[status] || status
}

const getRoleColor = (role) => {
  const colors = {
    admin: 'error',
    member: 'primary',
    normal: 'success'
  }
  return colors[role] || 'grey'
}

const getRoleText = (role) => {
  const texts = {
    admin: '管理员',
    member: '会员',
    normal: '普通用户'
  }
  return texts[role] || role
}

// 处理用户操作
const handleCreate = async (userData) => {
  try {
    const response = await fetch('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    if (response.ok) {
      showCreateDialog.value = false
      await fetchUsers()
    }
  } catch (error) {
    console.error('创建用户失败:', error)
  }
}

const handleEdit = (user) => {
  selectedUser.value = user
  showEditDialog.value = true
}

const handleUpdate = async (userData) => {
  try {
    const response = await fetch(`/api/v1/users/${selectedUser.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    if (response.ok) {
      showEditDialog.value = false
      await fetchUsers()
    }
  } catch (error) {
    console.error('更新用户失败:', error)
  }
}

const handleDelete = (user) => {
  selectedUser.value = user
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    const response = await fetch(`/api/v1/users/${selectedUser.value.id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      showDeleteDialog.value = false
      await fetchUsers()
    }
  } catch (error) {
    console.error('删除用户失败:', error)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}
</style> 