<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10">
        <v-card class="system-card">
          <!-- 标签页 -->
          <v-tabs v-model="activeTab">
            <v-tab value="basic">基础设置</v-tab>
            <v-tab value="membership">会员设置</v-tab>
          </v-tabs>

          <v-divider></v-divider>

          <v-window v-model="activeTab">
            <!-- 基础设置标签页 -->
            <v-window-item value="basic">
              <v-card-title class="d-flex align-center py-4 px-6">
                <h2 class="text-h5 font-weight-bold mb-0">系统管理</h2>
              </v-card-title>

              <v-divider></v-divider>

              <v-card-text class="pa-6">
                <!-- 页面管理模块 -->
                <div class="mb-8">
                  <h3 class="text-h6 font-weight-bold mb-4">页面管理</h3>
                  
                  <!-- Logo上传 -->
                  <v-card variant="outlined" class="mb-6">
                    <v-card-text>
                      <div class="d-flex align-center mb-4">
                        <h4 class="text-subtitle-1 font-weight-bold">Logo设置</h4>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          size="small"
                          :loading="isUploadingLogo"
                          @click="saveLogo"
                          :disabled="!selectedLogo"
                        >
                          保存Logo
                        </v-btn>
                      </div>
                      
                      <div class="d-flex align-center gap-4">
                        <v-img
                          :src="currentLogo || systemSettings.logo"
                          max-width="200"
                          contain
                          class="grey lighten-4 rounded"
                          @error="handleLogoError"
                        ></v-img>
                        <div>
                          <v-file-input
                            v-model="selectedLogo"
                            label="选择Logo"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            prepend-icon="mdi-image"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            class="max-w-300"
                            @change="previewLogo"
                          ></v-file-input>
                          <div class="text-caption text-grey mt-2">
                            建议上传正方形图片，支持JPG、PNG、GIF、WEBP格式，系统会自动调整为500x500px
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>

                  <!-- 页面标题设置 -->
                  <v-card variant="outlined" class="mb-6">
                    <v-card-text>
                      <div class="d-flex align-center mb-4">
                        <h4 class="text-subtitle-1 font-weight-bold">页面标题设置</h4>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          size="small"
                          :loading="isSavingTitle"
                          @click="savePageTitle"
                        >
                          保存标题
                        </v-btn>
                      </div>
                      
                      <v-text-field
                        v-model="pageTitle"
                        label="网站标题"
                        variant="outlined"
                        density="comfortable"
                        placeholder="请输入网站标题"
                        :rules="[rules.required]"
                        hide-details
                        class="max-w-500"
                      ></v-text-field>
                    </v-card-text>
                  </v-card>

                  <!-- API设置 -->
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="d-flex align-center mb-4">
                        <h4 class="text-subtitle-1 font-weight-bold">API设置</h4>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="info"
                          size="small"
                          class="mr-2"
                          :loading="isTestingApi"
                          @click="testApiConnection"
                        >
                          测试连接
                        </v-btn>
                        <v-btn
                          color="primary"
                          size="small"
                          :loading="isSavingApi"
                          @click="saveApiSettings"
                        >
                          保存设置
                        </v-btn>
                      </div>
                      
                      <v-text-field
                        v-model="apiKey"
                        label="Claude API Key"
                        variant="outlined"
                        density="comfortable"
                        placeholder="请输入Claude API Key"
                        :rules="[rules.required]"
                        :type="showApiKey ? 'text' : 'password'"
                        :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append-inner="showApiKey = !showApiKey"
                        hide-details
                        class="mb-4 max-w-500"
                      ></v-text-field>

                      <v-text-field
                        v-model="apiEndpoint"
                        label="API Endpoint"
                        variant="outlined"
                        density="comfortable"
                        placeholder="请输入API接口地址"
                        :rules="[rules.required, rules.url]"
                        hide-details
                        class="max-w-500"
                      ></v-text-field>
                    </v-card-text>
                  </v-card>

                  <!-- 数据库状态卡片 -->
                  <v-card variant="outlined" class="mt-6">
                    <v-card-text>
                      <div class="d-flex align-center mb-4">
                        <h4 class="text-subtitle-1 font-weight-bold">数据库状态</h4>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="info"
                          size="small"
                          class="mr-2"
                          :loading="isCheckingDB"
                          @click="checkDatabaseStatus"
                        >
                          检查连接
                        </v-btn>
                        <v-btn
                          color="primary"
                          size="small"
                          :loading="isSavingDbConfig"
                          @click="saveDbConfig"
                        >
                          保存设置
                        </v-btn>
                      </div>
                      
                      <!-- 添加数据库连接地址输入框 -->
                      <v-text-field
                        v-model="dbConfig.url"
                        label="数据库连接地址"
                        variant="outlined"
                        density="comfortable"
                        placeholder="mongodb://username:password@host:port"
                        :rules="[rules.required]"
                        :type="showDbUrl ? 'text' : 'password'"
                        :append-inner-icon="showDbUrl ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append-inner="showDbUrl = !showDbUrl"
                        hide-details
                        class="mb-4 max-w-500"
                      ></v-text-field>
                      
                      <!-- 连接状态显示 -->
                      <div class="d-flex align-center mt-4">
                        <v-icon
                          :color="dbStatus.connected ? 'success' : 'error'"
                          class="mr-2"
                        >
                          {{ dbStatus.connected ? 'mdi-database-check' : 'mdi-database-remove' }}
                        </v-icon>
                        <span :class="{'text-success': dbStatus.connected, 'text-error': !dbStatus.connected}">
                          {{ dbStatus.state }}
                        </span>
                        <v-chip
                          v-if="dbStatus.connected"
                          color="success"
                          size="small"
                          class="ml-4"
                        >
                          已连接
                        </v-chip>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card-text>
            </v-window-item>

            <!-- 会员设置标签页 -->
            <v-window-item value="membership">
              <v-card-text class="pa-6">
                <!-- 会员方案设置 -->
                <div class="mb-8">
                  <div class="d-flex align-center mb-4">
                    <h3 class="text-h6 font-weight-bold">会员方案设置</h3>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      size="small"
                      :loading="isSavingPlans"
                      @click="saveMembershipPlans"
                    >
                      保存设置
                    </v-btn>
                  </div>

                  <!-- 周会员设置 -->
                  <v-card variant="outlined" class="mb-4">
                    <v-card-text>
                      <h4 class="text-subtitle-1 font-weight-bold mb-4">周会员</h4>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="membershipPlans.week.price"
                            label="价格(元)"
                            type="number"
                            variant="outlined"
                            density="comfortable"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="membershipPlans.week.benefits"
                            label="会员权益(每行一条)"
                            variant="outlined"
                            auto-grow
                            rows="3"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <!-- 月会员设置 -->
                  <v-card variant="outlined" class="mb-4">
                    <v-card-text>
                      <h4 class="text-subtitle-1 font-weight-bold mb-4">月会员</h4>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="membershipPlans.month.price"
                            label="价格(元)"
                            type="number"
                            variant="outlined"
                            density="comfortable"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="membershipPlans.month.benefits"
                            label="会员权益(每行一条)"
                            variant="outlined"
                            auto-grow
                            rows="3"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <!-- 季会员设置 -->
                  <v-card variant="outlined">
                    <v-card-text>
                      <h4 class="text-subtitle-1 font-weight-bold mb-4">季会员</h4>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="membershipPlans.quarter.price"
                            label="价格(元)"
                            type="number"
                            variant="outlined"
                            density="comfortable"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="membershipPlans.quarter.benefits"
                            label="会员权益(每行一条)"
                            variant="outlined"
                            auto-grow
                            rows="3"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </div>

                <!-- 支付设置 -->
                <div class="mb-8">
                  <div class="d-flex align-center mb-4">
                    <h3 class="text-h6 font-weight-bold">微信支付设置</h3>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      size="small"
                      :loading="isSavingPayment"
                      @click="savePaymentConfig"
                    >
                      保存设置
                    </v-btn>
                  </div>

                  <v-card variant="outlined">
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.appId"
                            label="AppID"
                            variant="outlined"
                            density="comfortable"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.mchId"
                            label="商户号"
                            variant="outlined"
                            density="comfortable"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.apiKey"
                            label="API密钥"
                            variant="outlined"
                            density="comfortable"
                            type="password"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="paymentConfig.notifyUrl"
                            label="回调通知地址"
                            variant="outlined"
                            density="comfortable"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- 操作结果提示 -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { systemApi } from '@/api/system'
import imageCompression from 'browser-image-compression'

const systemSettings = inject('systemSettings')

// 表单数据
const selectedLogo = ref(null)
const currentLogo = ref(null)
const pageTitle = ref('')
const apiKey = ref('')
const apiEndpoint = ref('')
const showApiKey = ref(false)

// 添加数据状态的初始值
const dbStatus = ref({
  connected: false,
  state: '未检查'
})

// 加载状态
const isUploadingLogo = ref(false)
const isSavingTitle = ref(false)
const isSavingApi = ref(false)
const isTestingApi = ref(false)
const isCheckingDB = ref(false)

// 提示信息
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// 验证规则
const rules = {
  required: v => !!v || '此项为必填',
  url: v => {
    try {
      new URL(v)
      return true
    } catch {
      return '请输入有效的URL地���'
    }
  }
}

// 添加图片处理配置
const imageConfig = {
  maxSizeMB: 2,          // 最大2MB
  maxWidthOrHeight: 500, // 最大尺寸500px
  useWebWorker: true,    // 使用Web Worker处理压缩
  fileType: 'image/png'  // 输出PNG格式
}

// 处理图片压缩和调整尺寸
const processImage = async (file) => {
  try {
    // 显示处理提示
    showSuccessMessage('正在处理图片，请稍候...')
    
    // 压缩图片
    const compressedFile = await imageCompression(file, imageConfig)
    
    // 创建图片对象用于获取尺寸
    const img = new Image()
    const imgUrl = URL.createObjectURL(compressedFile)
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // 如果图片尺寸不是正方形，需要裁剪
          if (img.width !== img.height) {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const size = Math.min(img.width, img.height)
            
            canvas.width = imageConfig.maxWidthOrHeight
            canvas.height = imageConfig.maxWidthOrHeight
            
            // 计算裁剪位置，使图片居中
            const sx = (img.width - size) / 2
            const sy = (img.height - size) / 2
            
            // 绘制裁剪后的图片
            ctx.drawImage(
              img,
              sx, sy, size, size,
              0, 0, canvas.width, canvas.height
            )
            
            // 转换为Blob
            const blob = await new Promise(resolve => {
              canvas.toBlob(resolve, imageConfig.fileType, 0.9)
            })
            
            resolve(new File([blob], file.name, { type: imageConfig.fileType }))
          } else {
            resolve(compressedFile)
          }
        } catch (error) {
          reject(error)
        } finally {
          URL.revokeObjectURL(imgUrl)
        }
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(imgUrl)
        reject(new Error('图片加载失败'))
      }
      
      img.src = imgUrl
    })
  } catch (error) {
    throw new Error('图片处理失败：' + error.message)
  }
}

// 修改Logo预览方法
const previewLogo = async (file) => {
  if (!file) {
    currentLogo.value = null
    selectedLogo.value = null
    return
  }

  try {
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      throw new Error('请选择JPG、PNG、GIF或WEBP格式的图片')
    }

    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('文件大小不能超过10MB')
    }

    // 显示处理提示
    showSuccessMessage('正在处理图片，请稍候...')

    // 压缩图片
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 500,
      useWebWorker: true,
      fileType: 'image/png',
      initialQuality: 1
    })

    // 创建图片对象用于获取尺寸
    const img = new Image()
    const imgUrl = URL.createObjectURL(compressedFile)

    try {
      await new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            // 如果图片尺寸不是正方形，需要裁剪
            if (img.width !== img.height) {
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              const size = Math.min(img.width, img.height)
              
              canvas.width = 500
              canvas.height = 500
              
              // 计算裁剪位置，使图片居中
              const sx = (img.width - size) / 2
              const sy = (img.height - size) / 2
              
              // 绘制裁剪后的图片
              ctx.drawImage(
                img,
                sx, sy, size, size,
                0, 0, canvas.width, canvas.height
              )
              
              // 转换为Blob
              canvas.toBlob(async (blob) => {
                if (!blob) {
                  reject(new Error('图片处理失败'))
                  return
                }
                
                // 创建新的File对象
                const processedFile = new File([blob], file.name, {
                  type: 'image/png',
                  lastModified: new Date().getTime()
                })
                
                // 更新选中的文件
                selectedLogo.value = processedFile
                
                // 预览处理后的图片
                const reader = new FileReader()
                reader.onload = (e) => {
                  currentLogo.value = e.target.result
                  resolve()
                }
                reader.onerror = reject
                reader.readAsDataURL(processedFile)
              }, 'image/png', 1)
            } else {
              // 如果已经是正方形，直接使用压缩后的件
              selectedLogo.value = compressedFile
              const reader = new FileReader()
              reader.onload = (e) => {
                currentLogo.value = e.target.result
                resolve()
              }
              reader.onerror = reject
              reader.readAsDataURL(compressedFile)
            }
          } catch (error) {
            reject(error)
          }
        }
        
        img.onerror = () => {
          reject(new Error('图片加载失败'))
        }
        
        img.src = imgUrl
      })

      showSuccessMessage('图片处理完成')
    } catch (error) {
      throw error
    } finally {
      URL.revokeObjectURL(imgUrl)
    }
  } catch (error) {
    console.error('Image processing error:', error)
    showErrorMessage(error.message)
    selectedLogo.value = null
    currentLogo.value = null
  }
}

// 处理logo加载失败
const handleLogoError = (e) => {
  e.target.src = '/logo.svg'
}

// 获取系统设置
const fetchSettings = async () => {
  try {
    const response = await systemApi.getSettings()
    const { 
      title, 
      apiKey: savedApiKey, 
      apiEndpoint: savedEndpoint, 
      logo,
      dbUrl 
    } = response.data
    
    pageTitle.value = title || ''
    apiKey.value = savedApiKey || ''
    apiEndpoint.value = savedEndpoint || ''
    currentLogo.value = logo || '/logo.svg'
    dbConfig.value.url = dbUrl || ''
  } catch (error) {
    console.error('获取设置失败:', error)
    showErrorMessage('获取设置失败：' + error.message)
  }
}

// 修改保存Logo方法
const saveLogo = async () => {
  if (!selectedLogo.value) return
  
  isUploadingLogo.value = true
  try {
    const formData = new FormData()
    formData.append('logo', selectedLogo.value)
    
    const response = await systemApi.uploadLogo(formData)
    
    if (response.data.success) {
      // 更新全局系统设置
      const updateSystemSettings = inject('updateSystemSettings')
      updateSystemSettings({ logo: response.data.logo })
      
      showSuccessMessage('Logo更新成功')
      
      // 清除选择的文件
      selectedLogo.value = null
      currentLogo.value = null
      
      // 添加时间戳避免缓存
      const timestamp = new Date().getTime()
      systemSettings.value.logo = `${response.data.logo}?t=${timestamp}`
    }
  } catch (error) {
    console.error('Logo更新失败:', error)
    const errorMessage = error.response?.data?.error || error.message
    showErrorMessage(`Logo更新失败：${errorMessage}`)
  } finally {
    isUploadingLogo.value = false
  }
}

// 保存页面标题
const savePageTitle = async () => {
  if (!pageTitle.value) return
  
  isSavingTitle.value = true
  try {
    await systemApi.updateTitle(pageTitle.value)
    showSuccessMessage('网站标题更新成功')
  } catch (error) {
    showErrorMessage('网站标题更新失败：' + error.message)
  } finally {
    isSavingTitle.value = false
  }
}

// 保存API设置
const saveApiSettings = async () => {
  if (!apiKey.value || !apiEndpoint.value) return
  
  isSavingApi.value = true
  try {
    await systemApi.updateApi(apiKey.value, apiEndpoint.value)
    showSuccessMessage('API设置保存成功')
  } catch (error) {
    showErrorMessage('API设置保存失败：' + error.message)
  } finally {
    isSavingApi.value = false
  }
}

// 测试API连接
const testApiConnection = async () => {
  if (!apiKey.value || !apiEndpoint.value) {
    showErrorMessage('请先填写API设置')
    return
  }
  
  isTestingApi.value = true
  try {
    const response = await systemApi.testApi(apiKey.value, apiEndpoint.value)
    
    if (response.data.success) {
      showSuccessMessage('API连接测试成功')
    } else {
      showErrorMessage('API连接测试失败：' + response.data.message)
    }
  } catch (error) {
    showErrorMessage('API连接测试失败：' + error.message)
  } finally {
    isTestingApi.value = false
  }
}

// 检查数据库状态
const checkDatabaseStatus = async () => {
  isCheckingDB.value = true
  try {
    const response = await systemApi.checkDbStatus()
    if (response.data) {
      dbStatus.value = response.data.database
      
      if (dbStatus.value.connected) {
        showSuccessMessage('数据库连接正常')
      } else {
        const errorMsg = dbStatus.value.error 
          ? `数据库连接异常: ${dbStatus.value.error}`
          : `数据库连接异常: ${dbStatus.value.state}`
        showErrorMessage(errorMsg)
      }
    } else {
      throw new Error('无效的响应数据')
    }
  } catch (error) {
    console.error('检查数据库状态失败:', error)
    dbStatus.value = {
      connected: false,
      state: '连接失败'
    }
    const errorMsg = error.response?.data?.database?.error || error.message
    showErrorMessage('检查数据库状态失败：' + errorMsg)
  } finally {
    isCheckingDB.value = false
  }
}

// 显示成功提示
const showSuccessMessage = (message) => {
  snackbarColor.value = 'success'
  snackbarText.value = message
  showSnackbar.value = true
}

// 显示错误提示
const showErrorMessage = (message) => {
  snackbarColor.value = 'error'
  snackbarText.value = message
  showSnackbar.value = true
}

// 添加数据库配置状态
const dbConfig = ref({
  url: ''
})
const showDbUrl = ref(false)
const isSavingDbConfig = ref(false)

// 保存数据库配置
const saveDbConfig = async () => {
  if (!dbConfig.value.url) {
    showErrorMessage('数据库连接地址不能为空')
    return
  }
  
  isSavingDbConfig.value = true
  try {
    const response = await systemApi.updateDbConfig(dbConfig.value.url)
    
    if (response.data.success) {
      showSuccessMessage('数据库配置保存成功')
      await checkDatabaseStatus()
    } else {
      throw new Error(response.data.error || '保存失败')
    }
  } catch (error) {
    console.error('Save database config error:', error)
    const errorMessage = error.response?.data?.error || error.message
    showErrorMessage('数据库配置保存失败：' + errorMessage)
  } finally {
    isSavingDbConfig.value = false
  }
}

// 添加会员设置相关状态
const activeTab = ref('basic')
const isSavingPlans = ref(false)
const isSavingPayment = ref(false)

const membershipPlans = ref({
  week: {
    price: 0,
    benefits: ''
  },
  month: {
    price: 0,
    benefits: ''
  },
  quarter: {
    price: 0,
    benefits: ''
  }
})

const paymentConfig = ref({
  appId: '',
  mchId: '',
  apiKey: '',
  notifyUrl: ''
})

// 获取会员设置
const fetchMembershipSettings = async () => {
  try {
    const response = await systemApi.getMembershipSettings()
    const { plans, payment } = response.data
    
    // 更新会员方案
    Object.keys(plans).forEach(type => {
      membershipPlans.value[type].price = plans[type].price
      membershipPlans.value[type].benefits = plans[type].benefits.join('\n')
    })
    
    // 更新支付配置
    Object.assign(paymentConfig.value, payment)
  } catch (error) {
    console.error('获取会员设置失败:', error)
    showErrorMessage('获取会员设置失败：' + error.message)
  }
}

// 保存会员方案
const saveMembershipPlans = async () => {
  isSavingPlans.value = true
  try {
    const plans = {}
    Object.keys(membershipPlans.value).forEach(type => {
      plans[type] = {
        price: Number(membershipPlans.value[type].price),
        benefits: membershipPlans.value[type].benefits.split('\n').filter(b => b.trim())
      }
    })
    
    await systemApi.updateMembershipPlans(plans)
    showSuccessMessage('会员方案保存成功')
  } catch (error) {
    console.error('保存会员方案失败:', error)
    showErrorMessage('保存会员方案失败：' + error.message)
  } finally {
    isSavingPlans.value = false
  }
}

// 保存支付配置
const savePaymentConfig = async () => {
  isSavingPayment.value = true
  try {
    await systemApi.updatePaymentConfig(paymentConfig.value)
    showSuccessMessage('支付配置保存成功')
  } catch (error) {
    console.error('保存支付配置失败:', error)
    showErrorMessage('保存支付配置失败：' + error.message)
  } finally {
    isSavingPayment.value = false
  }
}

// 页面初始化时获取设置
onMounted(async () => {
  await Promise.all([
    fetchSettings(),
    fetchMembershipSettings()
  ])
})
</script>

<style scoped>
.system-card {
  border-radius: 16px;
}

.max-w-300 {
  max-width: 300px;
}

.max-w-500 {
  max-width: 500px;
}

.v-card {
  transition: box-shadow 0.2s;
}

.v-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.text-success {
  color: rgb(var(--v-theme-success)) !important;
}

.text-error {
  color: rgb(var(--v-theme-error)) !important;
}

.verification-code-container {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style> 