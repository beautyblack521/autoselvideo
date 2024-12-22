<template>
  <v-dialog v-model="dialog" max-width="420px" persistent>
    <v-card class="login-card">
      <!-- 关闭按钮 -->
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        class="close-btn"
        @click="closeDialog"
      ></v-btn>

      <!-- 标题区域 -->
      <div class="text-center pt-8 pb-4">
        <h2 class="text-h4 font-weight-bold gradient-text mb-2">欢迎回来</h2>
        <p class="text-subtitle-1 text-medium-emphasis">请登录您的账号</p>
      </div>

      <v-card-text class="px-6 py-4">
        <v-form ref="form" v-model="isValid">
          <!-- 手机号码输入 -->
          <v-text-field
            v-model="phone"
            label="手机号码"
            variant="outlined"
            :rules="[rules.required, rules.phone]"
            placeholder="请输入手机号码"
            class="mb-4"
            prepend-inner-icon="mdi-phone"
            density="comfortable"
          ></v-text-field>

          <!-- 验证码输入和获取按钮 -->
          <div class="verification-code-container">
            <v-text-field
              v-model="verificationCode"
              label="验证码"
              variant="outlined"
              :rules="[rules.required, rules.verificationCode]"
              placeholder="请输入验证码"
              class="verification-input"
              prepend-inner-icon="mdi-shield-key"
              density="comfortable"
              hide-details
            ></v-text-field>
            <v-btn
              :color="countdown > 0 ? 'grey' : 'primary'"
              :disabled="!isPhoneValid || countdown > 0"
              @click="getVerificationCode"
              class="get-code-btn"
              height="44"
              min-width="120"
              variant="tonal"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-btn
          block
          color="primary"
          size="large"
          :loading="isLoading"
          :disabled="!isValid"
          @click="handleLogin"
          class="login-btn"
          height="48"
        >
          登录
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'login-success'])

const userStore = useUserStore()
const form = ref(null)
const phone = ref('')
const verificationCode = ref('')
const isValid = ref(false)
const isLoading = ref(false)
const countdown = ref(0)

// 验证规则
const rules = {
  required: v => !!v || '此项为必填',
  phone: v => /^1[3-9]\d{9}$/.test(v) || '请输入正确的手机号码',
  verificationCode: v => /^\d{4}$/.test(v) || '请输入4位数验证码'
}

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isPhoneValid = computed(() => {
  return rules.phone(phone.value) === true
})

// 获取验证码
const getVerificationCode = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 处理登录
const handleLogin = async () => {
  if (!form.value.validate()) return

  isLoading.value = true
  try {
    // 测试账号验证
    const testAccounts = {
      '13911160174': { code: '0000', role: 'admin' },
      '13911111111': { code: '1111', role: 'member' },
      '13911112222': { code: '2222', role: 'normal' }
    }

    const account = testAccounts[phone.value]
    if (!account || account.code !== verificationCode.value) {
      throw new Error('手机号或验证码错误')
    }

    // 登录成功，更新用户状态
    await userStore.login({
      phone: phone.value,
      role: account.role
    })

    emit('login-success')
    closeDialog()
  } catch (error) {
    console.error('登录失败:', error)
    alert(error.message)
  } finally {
    isLoading.value = false
  }
}

const closeDialog = () => {
  dialog.value = false
  form.value?.reset()
  phone.value = ''
  verificationCode.value = ''
}
</script>

<style scoped>
.login-card {
  border-radius: 16px;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  right: 8px;
  top: 8px;
}

.gradient-text {
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.v-text-field :deep(.v-field__input) {
  font-size: 14px;
  padding: 8px 12px;
}

.v-text-field :deep(.v-field__outline__start) {
  border-radius: 8px 0 0 8px;
}

.v-text-field :deep(.v-field__outline__end) {
  border-radius: 0 8px 8px 0;
}

.verification-code-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.verification-input {
  flex: 1;
}

.verification-input :deep(.v-input__control) {
  height: 44px;
}

.verification-input :deep(.v-field__input) {
  min-height: 44px;
  padding-top: 0;
  padding-bottom: 0;
}

.get-code-btn {
  margin-top: 0;
  white-space: nowrap;
}

.login-btn {
  border-radius: 8px;
  text-transform: none;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
</style> 