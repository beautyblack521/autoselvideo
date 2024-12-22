<template>
  <v-container class="py-4">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <h1 class="text-h5 font-weight-medium mb-0">角色管理</h1>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            prepend-icon="mdi-shield-plus"
            @click="showCreateDialog = true"
          >
            添加角色
          </v-btn>
        </div>

        <!-- 角色列表 -->
        <v-card>
          <v-data-table
            :headers="headers"
            :items="roles"
            :loading="loading"
            :items-per-page="10"
          >
            <!-- 权限显示 -->
            <template v-slot:item.permissions="{ item }">
              <v-chip-group>
                <v-chip
                  v-for="permission in item.permissions.slice(0, 3)"
                  :key="permission"
                  size="small"
                  color="primary"
                  variant="outlined"
                >
                  {{ getPermissionText(permission) }}
                </v-chip>
                <v-chip
                  v-if="item.permissions.length > 3"
                  size="small"
                  color="grey"
                >
                  +{{ item.permissions.length - 3 }}
                </v-chip>
              </v-chip-group>
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

    <!-- 角色对话框 -->
    <RoleDialog
      v-model="showDialog"
      :role="selectedRole"
      @submit="handleSubmit"
    />

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">确认删除</v-card-title>
        <v-card-text>
          确定要删除角色 "{{ selectedRole?.name }}" 吗？此操作不可恢复。
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
import { useRoleStore } from '@/stores/role'
import RoleDialog from '@/components/admin/RoleDialog.vue'
import { Permissions } from '@/constants/permissions'

const roleStore = useRoleStore()

// 表格配置
const headers = [
  { title: '角色名称', key: 'name', align: 'start' },
  { title: '描述', key: 'description', align: 'start' },
  { title: '权限', key: 'permissions', align: 'start' },
  { title: '创建时间', key: 'created_at', align: 'center' },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

// 数据状态
const roles = ref([])
const loading = ref(false)
const deleting = ref(false)

// 对话框状态
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedRole = ref(null)

// 获取角色列表
const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await roleStore.fetchRoles()
    roles.value = response
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 权限显示
const getPermissionText = (permission) => {
  return Permissions[permission] || permission
}

// 处理角色操作
const handleSubmit = async (roleData) => {
  try {
    if (selectedRole.value) {
      await roleStore.updateRole(selectedRole.value.id, roleData)
    } else {
      await roleStore.createRole(roleData)
    }
    showDialog.value = false
    await fetchRoles()
  } catch (error) {
    console.error('保存角色失败:', error)
  }
}

const handleEdit = (role) => {
  selectedRole.value = role
  showDialog.value = true
}

const handleDelete = (role) => {
  selectedRole.value = role
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await roleStore.deleteRole(selectedRole.value.id)
    showDeleteDialog.value = false
    await fetchRoles()
  } catch (error) {
    console.error('删除角色失败:', error)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}
</style> 