<template>
  <v-dialog v-model="dialog" max-width="420px" persistent>
    <v-card class="register-card">
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
        <h2 class="text-h4 font-weight-bold gradient-text mb-2">创建账号</h2>
        <p class="text-subtitle-1 text-medium-emphasis">加入我们的社区</p>
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

          <!-- 用户协议 -->
          <v-checkbox
            v-model="agreeToTerms"
            :rules="[rules.agreement]"
            class="mt-2"
          >
            <template v-slot:label>
              <span class="text-body-2">
                我已阅读并同意
                <a href="#" class="text-primary text-decoration-none">用户协议</a>
                和
                <a href="#" class="text-primary text-decoration-none">隐私政策</a>
              </span>
            </template>
          </v-checkbox>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-btn
          block
          color="primary"
          size="large"
          :loading="isLoading"
          :disabled="!isValid || !agreeToTerms"
          @click="handleRegister"
          class="register-btn"
          height="48"
        >
          注册
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'register-success'])

const userStore = useUserStore()
const form = ref(null)
const phone = ref('')
const verificationCode = ref('')
const isValid = ref(false)
const isLoading = ref(false)
const countdown = ref(0)
const agreeToTerms = ref(false)

// 验证规则
const rules = {
  required: v => !!v || '此项为必填',
  phone: v => /^1[3-9]\d{9}$/.test(v) || '请输入正确的手机号码',
  verificationCode: v => /^\d{4}$/.test(v) || '请输入4位数验证码',
  agreement: v => !!v || '请阅读并同意用户协议和隐私政策'
}

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isPhoneValid = computed(() => {
  return rules.phone(phone.value) === true
})

// 获取验证码
const getVerificationCode = async () => {
  if (!isPhoneValid.value) {
    showErrorMessage('请输入正确的手机号码')
    return
  }

  try {
    await axios.post('/api/user/send-verification-code', {
      phone: phone.value
    })
    
    showSuccessMessage('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('获取验证码失败:', error)
    showErrorMessage(error.response?.data?.error || '获取验证码失败，请重试')
  }
}

// 处理注册
const handleRegister = async () => {
  if (!form.value.validate()) return

  isLoading.value = true
  try {
    const response = await axios.post('/api/user/register', {
      phone: phone.value,
      verificationCode: verificationCode.value
    })

    if (response.data.success) {
      // 注册成功后自动登录
      await userStore.login({
        phone: phone.value,
        token: response.data.token,
        user: response.data.user
      })

      showSuccessMessage('注册成功')
      emit('register-success')
      closeDialog()
    } else {
      throw new Error(response.data.error)
    }
  } catch (error) {
    console.error('注册失败:', error)
    showErrorMessage(error.response?.data?.error || '注册失败，请重试')
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
.register-card {
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

.get-code-btn {
  border-radius: 8px;
  font-weight: 500;
}

.register-btn {
  border-radius: 8px;
  text-transform: none;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* 复选框样式 */
.v-checkbox :deep(.v-selection-control) {
  min-height: 20px;
}

.v-checkbox :deep(.v-label) {
  font-size: 14px;
  opacity: 0.8;
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
</style> 