<template>
  <v-dialog v-model="dialog" max-width="1000px">
    <v-card class="membership-dialog">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <div>
          <span class="text-h5 font-weight-bold gradient-text">会员中心</span>
          <div class="text-subtitle-2 text-medium-emphasis mt-1">
            解锁更多高级功能
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- 会员状态 -->
      <v-card-text class="pa-4">
        <div class="membership-status pa-4 rounded-lg mb-4" :class="statusClass">
          <div class="d-flex align-center">
            <div class="status-icon mr-4">
              <v-icon
                :icon="userStore.isMember ? 'mdi-crown' : 'mdi-account'"
                size="36"
                :color="userStore.isMember ? 'warning' : 'grey'"
              ></v-icon>
            </div>
            <div>
              <div class="text-h6 font-weight-bold">{{ membershipStatus }}</div>
              <div class="text-body-2 mt-1" v-if="userStore.isMember">
                会员有效期至：{{ expiryDate }}
                <span class="text-warning">(剩余 {{ remainingDays }} 天)</span>
              </div>
              <div class="text-body-2 mt-1" v-else>
                开通会员，享受更多权益
              </div>
            </div>
          </div>
        </div>

        <!-- 会员方案列表 -->
        <div class="plans-container">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">选择会员方案</h3>
          <v-row>
            <!-- 周会员 -->
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="plan-card" :class="{'selected': selectedPlan === 'week'}">
                <div class="plan-tag">体验特惠</div>
                <v-card-text class="text-center pa-4">
                  <h3 class="text-subtitle-1 mb-1">周会员</h3>
                  <div class="price-container mb-3">
                    <span class="currency">¥</span>
                    <span class="amount">{{ membershipPlans.week.price }}</span>
                    <span class="period">/周</span>
                  </div>
                  <v-divider class="mb-3"></v-divider>
                  <div class="benefits-list">
                    <div v-for="(benefit, index) in weekBenefits" :key="index" 
                      class="benefit-item" 
                      :class="{'highlight': index < 3}"
                    >
                      <v-icon 
                        :icon="index < 3 ? 'mdi-check-circle' : 'mdi-check'" 
                        :color="index < 3 ? 'warning' : 'success'" 
                        size="small" 
                        class="mr-2"
                      ></v-icon>
                      {{ benefit }}
                    </div>
                  </div>
                  <v-btn
                    block
                    color="primary"
                    class="mt-4"
                    height="40"
                    @click="selectPlan('week')"
                    :variant="selectedPlan === 'week' ? 'flat' : 'outlined'"
                  >
                    {{ selectedPlan === 'week' ? '已选择' : '选择' }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- 月会员 -->
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="plan-card" :class="{'selected': selectedPlan === 'month'}">
                <div class="plan-tag popular">最受欢迎</div>
                <v-card-text class="text-center pa-6">
                  <h3 class="text-h6 mb-2">月会员</h3>
                  <div class="price-container mb-4">
                    <span class="currency">¥</span>
                    <span class="amount">{{ membershipPlans.month.price }}</span>
                    <span class="period">/月</span>
                  </div>
                  <v-divider class="mb-4"></v-divider>
                  <div class="benefits-list">
                    <div v-for="(benefit, index) in monthBenefits" :key="index" 
                      class="benefit-item"
                      :class="{'highlight': index < 4}"
                    >
                      <v-icon 
                        :icon="index < 4 ? 'mdi-check-circle' : 'mdi-check'" 
                        :color="index < 4 ? 'warning' : 'success'" 
                        size="small" 
                        class="mr-2"
                      ></v-icon>
                      {{ benefit }}
                    </div>
                  </div>
                  <v-btn
                    block
                    color="primary"
                    class="mt-6"
                    height="48"
                    @click="selectPlan('month')"
                    :variant="selectedPlan === 'month' ? 'flat' : 'outlined'"
                  >
                    {{ selectedPlan === 'month' ? '已选择' : '选择' }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- 季会员 -->
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="plan-card" :class="{'selected': selectedPlan === 'quarter'}">
                <div class="plan-tag">超值优惠</div>
                <v-card-text class="text-center pa-6">
                  <h3 class="text-h6 mb-2">季会员</h3>
                  <div class="price-container mb-4">
                    <span class="currency">¥</span>
                    <span class="amount">{{ membershipPlans.quarter.price }}</span>
                    <span class="period">/季</span>
                  </div>
                  <v-divider class="mb-4"></v-divider>
                  <div class="benefits-list">
                    <div v-for="(benefit, index) in quarterBenefits" :key="index" 
                      class="benefit-item"
                      :class="{'highlight': index < 5}"
                    >
                      <v-icon 
                        :icon="index < 5 ? 'mdi-check-circle' : 'mdi-check'" 
                        :color="index < 5 ? 'warning' : 'success'" 
                        size="small" 
                        class="mr-2"
                      ></v-icon>
                      {{ benefit }}
                    </div>
                  </div>
                  <v-btn
                    block
                    color="primary"
                    class="mt-6"
                    height="48"
                    @click="selectPlan('quarter')"
                    :variant="selectedPlan === 'quarter' ? 'flat' : 'outlined'"
                  >
                    {{ selectedPlan === 'quarter' ? '已选择' : '选择' }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- 底部操作按钮 -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          size="large"
          min-width="160"
          height="44"
          :loading="isProcessing"
          :disabled="!selectedPlan"
          @click="handlePurchase"
        >
          立即开通
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 添加支付弹窗 -->
  <v-dialog v-model="showPaymentDialog" max-width="400px" persistent>
    <v-card class="payment-dialog">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6">微信支付</span>
        <v-btn icon="mdi-close" variant="text" @click="closePaymentDialog"></v-btn>
      </v-card-title>

      <v-card-text class="text-center pa-6">
        <!-- 订单信息 -->
        <div class="order-info mb-4">
          <div class="text-h5 font-weight-bold text-primary mb-2">
            ¥{{ selectedPlanPrice }}
          </div>
          <div class="text-body-1 text-medium-emphasis">
            {{ selectedPlanName }}
          </div>
        </div>

        <!-- 二维码区域 -->
        <div class="qrcode-container mb-4">
          <v-img
            :src="qrCodeUrl"
            width="200"
            height="200"
            class="mx-auto"
            :class="{ 'loading-qr': isGeneratingQR }"
          ></v-img>
          <div v-if="isGeneratingQR" class="qr-loading-text">
            <v-progress-circular
              indeterminate
              color="primary"
              size="24"
              class="mr-2"
            ></v-progress-circular>
            正在生成支付二维码...
          </div>
        </div>

        <!-- 支付提示 -->
        <div class="payment-tips text-body-2 text-medium-emphasis">
          <v-icon icon="mdi-cellphone" size="small" class="mr-1"></v-icon>
          请使用微信扫码支付
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  modelValue: Boolean,
  membershipPlans: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()
const selectedPlan = ref(null)
const isProcessing = ref(false)

// 计算会员状态
const membershipStatus = computed(() => {
  return userStore.isMember ? '会员用户' : '普通用户'
})

// 计算状态样式
const statusClass = computed(() => {
  return userStore.isMember ? 'member-status' : 'normal-status'
})

// 计算剩余天数
const remainingDays = computed(() => {
  return userStore.membershipDays || 0
})

// 修改默认会员权益，更详细的分级显示
const defaultBenefits = {
  week: [
    '每天10次AI生成额度',
    '支持批量下载',
    '标准生成速度',
    '普通客服支持',
    '7天会员有效期'
  ],
  month: [
    '每天50次AI生成额度',
    '支持批量下载',
    '优先生成处理',
    '专属客服服务',
    '会员专属模板',
    '30天会员有效期',
    '性价比优选'
  ],
  quarter: [
    '无限次AI生成额度',
    '支持批量下载',
    'VIP专属加速',
    '24小时专属客服',
    '会员专属模板',
    '自定义导出格式',
    '90天会员有效期',
    '最优惠价格'
  ]
}

// 修改权益列表的计算方式
const weekBenefits = computed(() => {
  return defaultBenefits.week
})

const monthBenefits = computed(() => {
  return defaultBenefits.month
})

const quarterBenefits = computed(() => {
  return defaultBenefits.quarter
})

// 对话框控制
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 选择会员方案
const selectPlan = (plan) => {
  selectedPlan.value = plan
}

// 处理购买
const handlePurchase = async () => {
  if (!selectedPlan.value) return
  
  isProcessing.value = true
  try {
    // TODO: 实现购买逻辑
    console.log('购买会员:', selectedPlan.value)
  } catch (error) {
    console.error('购买失败:', error)
  } finally {
    isProcessing.value = false
  }
}

const closeDialog = () => {
  dialog.value = false
  selectedPlan.value = null
}

// 添加通用会员权益
const commonBenefits = [
  {
    icon: 'mdi-rocket-launch',
    title: '无限生成',
    description: '无限次数生成视频内容'
  },
  {
    icon: 'mdi-download',
    title: '批量下载',
    description: '支持批量下载生成的内容'
  },
  {
    icon: 'mdi-clock-fast',
    title: '优先生成',
    description: '优先处理会员的生成请求'
  },
  {
    icon: 'mdi-crown',
    title: '专属客服',
    description: '专人解答使用问题'
  }
]

// 计算会员到期日期
const expiryDate = computed(() => {
  if (!userStore.membershipExpiry) return ''
  return new Date(userStore.membershipExpiry).toLocaleDateString('zh-CN')
})
</script>

<style scoped>
.membership-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.gradient-text {
  background: linear-gradient(45deg, #FFB300, #FF8F00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.membership-status {
  background-color: var(--v-background-base);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
}

.member-status {
  background: linear-gradient(135deg, rgba(255, 179, 0, 0.1), rgba(255, 143, 0, 0.05));
  border-color: rgba(255, 179, 0, 0.2);
}

.status-icon {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.benefit-card {
  height: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plan-card {
  height: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plan-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.plan-tag {
  position: absolute;
  top: 12px;
  right: -24px;
  background: rgba(var(--v-theme-warning), 0.9);
  color: white;
  padding: 4px 24px;
  font-size: 12px;
  transform: rotate(45deg);
}

.plan-tag.popular {
  background: rgba(var(--v-theme-error), 0.9);
}

.price-container {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.currency {
  font-size: 20px;
  margin-right: 4px;
  color: rgba(0, 0, 0, 0.87);
}

.amount {
  font-size: 36px;
  font-weight: bold;
  line-height: 1;
  color: rgba(0, 0, 0, 0.87);
}

.period {
  font-size: 14px;
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.6);
}

.benefits-list {
  text-align: left;
}

.benefit-item {
  margin-bottom: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.benefit-item.highlight {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
}

.benefit-item:not(.highlight) {
  color: rgba(0, 0, 0, 0.6);
}

.text-warning {
  color: rgb(var(--v-theme-warning));
}
</style> 