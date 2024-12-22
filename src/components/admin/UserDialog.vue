<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4">
        {{ user ? '编辑用户' : '创建用户' }}
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="form" v-model="isValid">
          <v-text-field
            v-model="formData.username"
            label="用户名"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          ></v-text-field>

          <v-text-field
            v-model="formData.email"
            label="邮箱"
            type="email"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            density="comfortable"
          ></v-text-field>

          <v-text-field
            v-if="!user"
            v-model="formData.password"
            label="密码"
            type="password"
            :rules="[rules.required, rules.password]"
            variant="outlined"
            density="comfortable"
          ></v-text-field>

          <v-select
            v-model="formData.role"
            label="角色"
            :items="roles"
            item-title="name"
            item-value="id"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          ></v-select>

          <v-select
            v-model="formData.status"
            label="状态"
            :items="statusOptions"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          ></v-select>
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

const props = defineProps({
  modelValue: Boolean,
  user: Object,
  roles: Array
})

const emit = defineEmits(['update:modelValue', 'submit'])

// 表单状态
const form = ref(null)
const isValid = ref(false)
const submitting = ref(false)

// 表单数据
const formData = ref({
  username: '',
  email: '',
  password: '',
  role: '',
  status: 'active'
})

// 状态选项
const statusOptions = [
  { title: '正常', value: 'active' },
  { title: '未激活', value: 'inactive' },
  { title: '已禁用', value: 'banned' }
]

// 表单验证规则
const rules = {
  required: v => !!v || '此字段必填',
  email: v => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址',
  password: v => v?.length >= 6 || '密码长度至少6位'
}

// 对话框状态
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 监听用户数据变化
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role_id,
      status: newUser.status
    }
  } else {
    formData.value = {
      username: '',
      email: '',
      password: '',
      role: '',
      status: 'active'
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