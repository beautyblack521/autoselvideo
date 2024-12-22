<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10">
        <v-card class="profile-card">
          <!-- 标题区域 -->
          <v-card-title class="d-flex align-center py-4 px-6">
            <h2 class="text-h5 font-weight-bold mb-0">个人中心</h2>
          </v-card-title>

          <v-divider></v-divider>

          <!-- 标签页 -->
          <v-tabs v-model="activeTab" class="px-6">
            <v-tab value="profile">基本信息</v-tab>
            <v-tab value="content">内容记录</v-tab>
            <v-tab value="orders">购买记录</v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <!-- 基本信息标签页 -->
            <v-window-item value="profile">
              <v-card-text class="pa-6">
                <!-- 会员状态卡片 -->
                <v-card variant="outlined" class="mb-6">
                  <v-card-text>
                    <div class="d-flex align-center">
                      <v-avatar
                        color="primary"
                        size="64"
                        class="mr-4"
                      >
                        <v-icon size="32" color="white">
                          {{ userStore.isMember ? 'mdi-crown' : 'mdi-account' }}
                        </v-icon>
                      </v-avatar>
                      <div>
                        <div class="text-h6">{{ profile.name || userStore.user?.phone }}</div>
                        <div class="text-subtitle-1 text-medium-emphasis">
                          {{ userStore.isMember ? '会员用户' : '普通用户' }}
                        </div>
                        <div v-if="userStore.isMember" class="text-caption mt-1">
                          会员有效期至：{{ formatDate(membershipExpiry) }}
                          <span class="text-warning">(剩余 {{ remainingDays }} 天)</span>
                        </div>
                      </div>
                      <v-spacer></v-spacer>
                      <v-btn
                        v-if="!userStore.isMember"
                        color="warning"
                        prepend-icon="mdi-crown"
                        @click="showMembershipDialog = true"
                      >
                        开通会员
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- 基本信息表单 -->
                <v-form ref="form" v-model="isValid" @submit.prevent="saveProfile">
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
                        v-model="profile.name"
                        label="昵称"
                        variant="outlined"
                        density="comfortable"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <div class="d-flex justify-end mt-4">
                    <v-btn
                      color="primary"
                      :loading="isSaving"
                      type="submit"
                    >
                      保存修改
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </v-window-item>

            <!-- 内容记录标签页 -->
            <v-window-item value="content">
              <v-card-text class="pa-6">
                <v-data-table
                  :headers="contentHeaders"
                  :items="contents"
                  :loading="isLoadingContent"
                  :items-per-page="10"
                  class="elevation-1"
                >
                  <!-- 标题列 -->
                  <template v-slot:item.title="{ item }">
                    <div class="text-truncate" style="max-width: 200px;">
                      {{ item.title }}
                    </div>
                  </template>

                  <!-- 状态列 -->
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      size="small"
                    >
                      {{ getStatusText(item.status) }}
                    </v-chip>
                  </template>

                  <!-- 操作列 -->
                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      icon="mdi-download"
                      variant="text"
                      size="small"
                      color="primary"
                      @click="downloadContent(item)"
                      :loading="item.downloading"
                    ></v-btn>
                  </template>

                  <!-- 分页器 -->
                  <template v-slot:bottom>
                    <div class="text-center pt-2">
                      <v-pagination
                        v-model="contentPage"
                        :length="contentTotalPages"
                        @update:modelValue="fetchContents"
                      ></v-pagination>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-window-item>

            <!-- 购买记录标签页 -->
            <v-window-item value="orders">
              <v-card-text class="pa-6">
                <v-data-table
                  :headers="orderHeaders"
                  :items="orders"
                  :loading="isLoadingOrders"
                  :items-per-page="10"
                  class="elevation-1"
                >
                  <!-- 订单状态 -->
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getOrderStatusColor(item.status)"
                      size="small"
                    >
                      {{ getOrderStatusText(item.status) }}
                    </v-chip>
                  </template>

                  <!-- 金额 -->
                  <template v-slot:item.amount="{ item }">
                    ¥{{ item.amount.toFixed(2) }}
                  </template>

                  <!-- 时间 -->
                  <template v-slot:item.createdAt="{ item }">
                    {{ formatDate(item.createdAt) }}
                  </template>

                  <!-- 分页器 -->
                  <template v-slot:bottom>
                    <div class="text-center pt-2">
                      <v-pagination
                        v-model="orderPage"
                        :length="orderTotalPages"
                        @update:modelValue="fetchOrders"
                      ></v-pagination>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- 会员购买对话框 -->
    <membership-dialog
      v-model="showMembershipDialog"
      :membership-plans="membershipPlans"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { systemApi } from '@/api/system'
import MembershipDialog from '@/components/MembershipDialog.vue'
import { saveAs } from 'file-saver'

const userStore = useUserStore()
const activeTab = ref('profile')
const showMembershipDialog = ref(false)

// 基本信息
const profile = ref({
  phone: userStore.user?.phone || '',
  name: userStore.user?.name || ''
})
const isValid = ref(true)
const isSaving = ref(false)

// 内容记录
const contents = ref([])
const contentPage = ref(1)
const contentTotalPages = ref(1)
const isLoadingContent = ref(false)
const contentHeaders = [
  { title: '标题', key: 'title', align: 'start' },
  { title: '状态', key: 'status', align: 'center' },
  { title: '创建时间', key: 'createdAt', align: 'center' },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

// 购买记录
const orders = ref([])
const orderPage = ref(1)
const orderTotalPages = ref(1)
const isLoadingOrders = ref(false)
const orderHeaders = [
  { title: '订单号', key: 'orderNo', align: 'start' },
  { title: '商品名称', key: 'productName', align: 'start' },
  { title: '金额', key: 'amount', align: 'center' },
  { title: '状态', key: 'status', align: 'center' },
  { title: '创建时间', key: 'createdAt', align: 'center' }
]

// 会员信息
const membershipExpiry = computed(() => userStore.user?.membershipExpiry)
const remainingDays = computed(() => {
  if (!membershipExpiry.value) return 0
  const days = Math.ceil((new Date(membershipExpiry.value) - new Date()) / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
})

// 获取内容记录
const fetchContents = async (page = 1) => {
  isLoadingContent.value = true
  try {
    const response = await systemApi.getUserContents(page)
    contents.value = response.data.items
    contentTotalPages.value = Math.ceil(response.data.total / 10)
  } catch (error) {
    console.error('获取内容记录失败:', error)
  } finally {
    isLoadingContent.value = false
  }
}

// 获取购买记录
const fetchOrders = async (page = 1) => {
  isLoadingOrders.value = true
  try {
    const response = await systemApi.getUserOrders(page)
    orders.value = response.data.items
    orderTotalPages.value = Math.ceil(response.data.total / 10)
  } catch (error) {
    console.error('获取购买记录失败:', error)
  } finally {
    isLoadingOrders.value = false
  }
}

// 下载内容
const downloadContent = async (content) => {
  content.downloading = true
  try {
    const response = await systemApi.downloadContent(content.id)
    const blob = new Blob([response.data], { type: 'application/octet-stream' })
    saveAs(blob, `${content.title}.docx`)
  } catch (error) {
    console.error('下载失败:', error)
  } finally {
    content.downloading = false
  }
}

// 保存个人信息
const saveProfile = async () => {
  isSaving.value = true
  try {
    await systemApi.updateUserProfile(profile.value)
    // 更新用户状态
    userStore.user = { ...userStore.user, ...profile.value }
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    isSaving.value = false
  }
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

// 获取状态颜色和文本
const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    completed: 'success',
    failed: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    pending: '处理中',
    completed: '已完成',
    failed: '失败'
  }
  return texts[status] || status
}

const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'error'
  }
  return colors[status] || 'grey'
}

const getOrderStatusText = (status) => {
  const texts = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消'
  }
  return texts[status] || status
}

onMounted(() => {
  fetchContents()
  fetchOrders()
})
</script>

<style scoped>
.profile-card {
  border-radius: 16px;
}

.text-warning {
  color: rgb(var(--v-theme-warning));
}
</style> 