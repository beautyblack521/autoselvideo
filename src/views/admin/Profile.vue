<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="profile-card">
          <v-card-title class="d-flex align-center py-4 px-6">
            <h2 class="text-h5 font-weight-bold mb-0">个人中心</h2>
          </v-card-title>

          <v-divider></v-divider>

          <!-- 添加标签页 -->
          <v-tabs v-model="activeTab" class="px-6">
            <v-tab value="profile">基本信息</v-tab>
            <v-tab value="orders">购买记录</v-tab>
          </v-tabs>

          <v-card-text class="pa-6">
            <v-window v-model="activeTab">
              <!-- 基本信息标签页 -->
              <v-window-item value="profile">
                <v-form ref="form" v-model="isValid">
                  <!-- 基本信息 -->
                  <div class="mb-6">
                    <h3 class="text-h6 font-weight-bold mb-4">基本信息</h3>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="profile.phone"
                          label="手机号码"
                          readonly
                          variant="outlined"
                          density="comfortable"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="profile.nickname"
                          label="昵称"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="comfortable"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- 其他设置 -->
                  <div class="mb-6">
                    <h3 class="text-h6 font-weight-bold mb-4">其他设置</h3>
                    <v-row>
                      <v-col cols="12">
                        <v-textarea
                          v-model="profile.signature"
                          label="个性签名"
                          variant="outlined"
                          rows="3"
                          density="comfortable"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </div>
                </v-form>

                <!-- 保存按钮 -->
                <div class="d-flex justify-end">
                  <v-btn
                    color="primary"
                    :loading="isSaving"
                    :disabled="!isValid"
                    @click="saveProfile"
                    min-width="120"
                  >
                    保存修改
                  </v-btn>
                </div>
              </v-window-item>

              <!-- 购买记录标签页 -->
              <v-window-item value="orders">
                <div class="orders-container">
                  <v-data-table
                    :headers="orderHeaders"
                    :items="orders"
                    :loading="isLoadingOrders"
                    class="elevation-1"
                  >
                    <template v-slot:item.status="{ item }">
                      <v-chip
                        :color="getStatusColor(item.status)"
                        size="small"
                      >
                        {{ getStatusText(item.status) }}
                      </v-chip>
                    </template>

                    <template v-slot:item.amount="{ item }">
                      ¥{{ item.amount.toFixed(2) }}
                    </template>

                    <template v-slot:item.createdAt="{ item }">
                      {{ formatDate(item.createdAt) }}
                    </template>

                    <template v-slot:item.paidAt="{ item }">
                      {{ item.paidAt ? formatDate(item.paidAt) : '-' }}
                    </template>
                  </v-data-table>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

const userStore = useUserStore()
const form = ref(null)
const isValid = ref(true)
const isSaving = ref(false)
const activeTab = ref('profile')
const isLoadingOrders = ref(false)

const profile = ref({
  phone: '',
  nickname: '',
  signature: '',
})

// 订单相关数据
const orders = ref([])
const orderHeaders = [
  { title: '订单号', key: 'orderNo', align: 'start' },
  { title: '商品名称', key: 'productName' },
  { title: '金额', key: 'amount' },
  { title: '支付方式', key: 'paymentMethod' },
  { title: '订单状态', key: 'status' },
  { title: '创建时间', key: 'createdAt' },
  { title: '支付时间', key: 'paidAt' },
]

// 获取订单状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'error'
  }
  return colors[status] || 'grey'
}

// 获取订单状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消'
  }
  return texts[status] || status
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取购买记录
const fetchOrders = async () => {
  isLoadingOrders.value = true
  try {
    const response = await axios.get('/api/admin/orders')
    orders.value = response.data
  } catch (error) {
    console.error('获取购买记录失败:', error)
    alert('获取购买记录失败，请重试')
  } finally {
    isLoadingOrders.value = false
  }
}

const rules = {
  required: v => !!v || '此项为必填'
}

const fetchProfile = async () => {
  try {
    const response = await axios.get('/api/admin/profile')
    profile.value = response.data
  } catch (error) {
    console.error('获取个人信息失败:', error)
    alert('获取个人信息失败，请重试')
  }
}

const saveProfile = async () => {
  if (!form.value.validate()) return

  isSaving.value = true
  try {
    await axios.post('/api/admin/profile', profile.value)
    alert('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchProfile()
  fetchOrders()
})
</script>

<style scoped>
.profile-card {
  border-radius: 16px;
}

.v-text-field :deep(.v-field__input),
.v-textarea :deep(.v-field__input) {
  font-size: 14px;
}

.orders-container {
  margin-top: 16px;
}

.v-data-table {
  border-radius: 8px;
}
</style> 