<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4">
        {{ role ? '编辑角色' : '创建角色' }}
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="form" v-model="isValid">
          <v-text-field
            v-model="formData.name"
            label="角色名称"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          ></v-text-field>

          <v-textarea
            v-model="formData.description"
            label="角色描述"
            variant="outlined"
            density="comfortable"
            rows="3"
          ></v-textarea>

          <div class="text-subtitle-1 mb-2">权限设置</div>
          <v-row>
            <v-col 
              v-for="(group, groupName) in permissionGroups" 
              :key="groupName"
              cols="12"
              md="6"
            >
              <v-card variant="outlined" class="pa-3">
                <div class="text-subtitle-2 mb-2">{{ groupName }}</div>
                <v-checkbox
                  v-for="permission in group"
                  :key="permission.value"
                  v-model="formData.permissions"
                  :label="permission.text"
                  :value="permission.value"
                  density="compact"
                  hide-details
                ></v-checkbox>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="closeDialog"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          :loading="submitting"
          @click="handleSubmit"
        >
          确定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Permissions } from '@/constants/permissions'

const props = defineProps({
  modelValue: Boolean,
  role: Object
})

const emit = defineEmits(['update:modelValue', 'submit'])

// 表单状态
const form = ref(null)
const isValid = ref(false)
const submitting = ref(false)

// 表单数据
const formData = ref({
  name: '',
  description: '',
  permissions: []
})

// 表单验证规则
const rules = {
  required: v => !!v || '此字段必填'
}

// 权限分组
const permissionGroups = {
  '用户管理': [
    { value: 'view_users', text: '查看用户' },
    { value: 'create_user', text: '创建用户' },
    { value: 'update_user', text: '编辑用户' },
    { value: 'delete_user', text: '删除用户' }
  ],
  '角色管理': [
    { value: 'view_roles', text: '查看角色' },
    { value: 'create_role', text: '创建角色' },
    { value: 'update_role', text: '编辑角色' },
    { value: 'delete_role', text: '删除角色' }
  ],
  '系统管理': [
    { value: 'view_logs', text: '查看日志' },
    { value: 'manage_system', text: '系统设置' }
  ]
}

// 对话框状态
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 监听角色数据变化
watch(() => props.role, (newRole) => {
  if (newRole) {
    formData.value = {
      name: newRole.name,
      description: newRole.description,
      permissions: [...newRole.permissions]
    }
  } else {
    formData.value = {
      name: '',
      description: '',
      permissions: []
    }
  }
}, { immediate: true })

// 处理提交
const handleSubmit = async () => {
  if (!form.value.validate()) return
  
  submitting.value = true
  try {
    emit('submit', formData.value)
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const closeDialog = () => {
  form.value?.reset()
  dialog.value = false
}
</script> 