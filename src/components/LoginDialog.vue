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
            :disabled="isLoading"
            :error="!!loginError"
            :error-messages="loginError"
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
              :disabled="isLoading"
            ></v-text-field>
            <v-btn
              :color="countdown > 0 ? 'grey' : 'primary'"
              :disabled="!isPhoneValid || countdown > 0 || isLoading"
              @click="getVerificationCode"
              class="get-code-btn"
              height="44"
              min-width="120"
              variant="tonal"
              :loading="isGettingCode"
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

      <!-- 错误提示 -->
      <v-snackbar
        v-model="showError"
        color="error"
        timeout="3000"
        location="top"
      >
        {{ errorMessage }}
      </v-snackbar>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
const isGettingCode = ref(false)
const countdown = ref(0)
const showError = ref(false)
const errorMessage = ref('')
const loginError = ref('')

// 表单验证规则
const rules = {
  required: v => !!v || '此项为必填',
  phone: v => /^1[3-9]\d{9}$/.test(v) || '请输入正确的手机号码',
  verificationCode: v => /^\d{4}$/.test(v) || '验证码为4位数字'
}

// 手机号码是否有效
const isPhoneValid = computed(() => {
  return rules.phone(phone.value) === true
})

// 对话框状态
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 获取验证码
const getVerificationCode = async () => {
  if (!isPhoneValid.value || isGettingCode.value) return
  
  isGettingCode.value = true
  try {
    await userStore.sendVerificationCode(phone.value)
    startCountdown()
  } catch (error) {
    showErrorMessage(error.message)
  } finally {
    isGettingCode.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
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
  loginError.value = ''
  
  try {
    await userStore.login(phone.value, verificationCode.value)
    emit('login-success')
    closeDialog()
  } catch (error) {
    loginError.value = error.message
    showErrorMessage(error.message)
  } finally {
    isLoading.value = false
  }
}

// 显示错误消息
const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
}

// 关闭对话框
const closeDialog = () => {
  form.value?.reset()
  phone.value = ''
  verificationCode.value = ''
  loginError.value = ''
  dialog.value = false
}

// 监听错误状态
watch(() => userStore.loginError, (error) => {
  if (error) {
    loginError.value = error
  }
})
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

.verification-code-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.verification-input {
  flex: 1;
}

.get-code-btn {
  white-space: nowrap;
}

.login-btn {
  text-transform: none;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style> 