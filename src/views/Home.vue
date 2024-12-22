<template>
  <v-container class="py-4">
    <!-- 顶部区域 -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <h1 class="text-h5 font-weight-medium mb-0">自媒体视频脚本Ai自动生成系统</h1>
          <v-spacer></v-spacer>
          
          <!-- 会员按钮 -->
          <v-btn
            color="warning"
            variant="tonal"
            class="mr-2"
            prepend-icon="mdi-crown"
            @click="showMembershipDialog = true"
          >
            {{ userStore.isMember ? '会员中心' : '开通会员' }}
          </v-btn>
          
          <v-btn
            v-if="userStore.isAdmin"
            color="primary"
            variant="text"
            prepend-icon="mdi-cog"
            @click="handleSystemSettings"
          >
            系统设置
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 输入区域 -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-text>
            <div class="d-flex flex-column">
              <!-- 视频链接输入 -->
              <v-text-field
                v-model="videoUrl"
                label="视频分享链接"
                placeholder="请输入抖音视频链接"
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <!-- 标题输入 -->
              <v-text-field
                v-model="title"
                label="视频标题"
                placeholder="给你的视频起个标题"
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <!-- 操作按钮 -->
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  variant="outlined"
                  :loading="isLoading"
                  @click="handleExecute"
                  prepend-icon="mdi-play"
                >
                  执行
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-download"
                >
                  下载视频
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-refresh"
                >
                  重新生成
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 结果表格 -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <!-- 修改表格工具栏 -->
          <v-toolbar density="compact" color="transparent" class="px-4">
            <div class="d-flex align-center w-100">
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-export"
                :loading="isExporting"
              >
                导出
                <v-menu activator="parent">
                  <v-list>
                    <v-list-item
                      v-for="(item, index) in exportOptions"
                      :key="index"
                      :value="item.type"
                      @click="handleExport(item.type)"
                    >
                      <template v-slot:prepend>
                        <v-icon :icon="item.icon" color="primary"></v-icon>
                      </template>
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-btn>
              
              <v-spacer></v-spacer>
              
              <!-- 居中显示标题 -->
              <div class="text-subtitle-1 text-medium-emphasis text-center flex-grow-1">
                {{ title || '未命名分镜脚本' }}
              </div>
              
              <v-spacer></v-spacer>
            </div>
          </v-toolbar>

          <!-- 表格内容 -->
          <v-data-table
            :headers="headers"
            :items="sections"
            class="elevation-1"
            :items-per-page="-1"
            hide-default-footer
          >
            <template v-slot:item.screenshot="{ item }">
              <v-img
                :src="item.raw.screenshot"
                width="120"
                height="80"
                cover
                class="rounded"
              ></v-img>
            </template>
          </v-data-table>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { systemApi } from '@/api/system'
import MembershipDialog from '@/components/MembershipDialog.vue'
// 导入导出相关库
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const videoUrl = ref('')
const title = ref('')
const isLoading = ref(false)

// 表格配置
const headers = [
  { title: '序号', key: 'id', align: 'center', width: '80px' },
  { title: '标题', key: 'title', align: 'start' },
  { title: '内容', key: 'content', align: 'start' },
  { title: '分镜图', key: 'screenshot', align: 'center', width: '150px' }
]

// 示例数据
const sections = ref([
  {
    id: 1,
    title: '开场介绍',
    content: '视频以平静的画面开场，镜头缓缓上升，展现出一望无际的蓝天。',
    screenshot: '/placeholder.jpg'
  },
  {
    id: 2,
    title: '主角登场',
    content: '一幅白色轻��从镜头右侧缓缓飘过船上的主角缓缓现身。',
    screenshot: '/placeholder.jpg'
  },
  {
    id: 3,
    title: '情景互动',
    content: '几只海鸥从船边飞过，与主角形成互动，营造出和谐的氛围。',
    screenshot: '/placeholder.jpg'
  },
  {
    id: 4,
    title: '日落结尾',
    content: '镜头转向落日，金色的阳光洒在海面上，构成唯美的收尾画面。',
    screenshot: '/placeholder.jpg'
  }
])

// 会员相关
const showMembershipDialog = ref(false)
const membershipPlans = ref({
  week: { price: 0, benefits: '' },
  month: { price: 0, benefits: '' },
  quarter: { price: 0, benefits: '' }
})

// 获取会员方案
const fetchMembershipPlans = async () => {
  try {
    const response = await systemApi.getMembershipSettings()
    membershipPlans.value = response.data.plans
  } catch (error) {
    console.error('获取会员方案失败:', error)
  }
}

onMounted(() => {
  fetchMembershipPlans()
})

// 处理系统设置
const handleSystemSettings = () => {
  router.push('/admin/system')
}

// 处理执行操作
const handleExecute = async () => {
  if (!videoUrl.value || !title.value) {
    alert('请填写完整信息')
    return
  }

  isLoading.value = true
  try {
    // TODO: 实现生成逻辑
    console.log('执行生成操作', {
      url: videoUrl.value,
      title: title.value
    })
  } catch (error) {
    console.error('生成失败:', error)
    alert('生成失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 导出相关
const isExporting = ref(false)
const exportOptions = [
  { type: 'word', title: '导出为Word', icon: 'mdi-microsoft-word' },
  { type: 'excel', title: '导出为Excel', icon: 'mdi-microsoft-excel' },
  { type: 'pdf', title: '导出为PDF', icon: 'mdi-file-pdf-box' }
]

// 处理导出
const handleExport = async (type) => {
  if (sections.value.length === 0) {
    alert('没有可导出的数据')
    return
  }

  isExporting.value = true
  try {
    switch (type) {
      case 'word':
        await exportToWord()
        break
      case 'excel':
        await exportToExcel()
        break
      case 'pdf':
        await exportToPDF()
        break
    }
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

// 导出为Word
const exportToWord = async () => {
  // 生成HTML内容
  let content = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          img { max-width: 120px; height: auto; }
        </style>
      </head>
      <body>
        <h1>视频内容分析</h1>
        <table>
          <tr>
            <th>序号</th>
            <th>标题</th>
            <th>内容</th>
          </tr>
          ${sections.value.map(section => `
            <tr>
              <td>${section.id}</td>
              <td>${section.title}</td>
              <td>${section.content}</td>
            </tr>
          `).join('')}
        </table>
      </body>
    </html>
  `

  // 转换为Blob并下载
  const blob = new Blob([content], { type: 'application/msword' })
  saveAs(blob, '视频内容分析.doc')
}

// 导出为Excel
const exportToExcel = async () => {
  // 准备数据
  const data = sections.value.map(section => ({
    '序号': section.id,
    '标题': section.title,
    '内容': section.content
  }))

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // 设置列宽
  ws['!cols'] = [
    { wch: 10 }, // 序号列宽
    { wch: 20 }, // 标题列宽
    { wch: 50 }  // 内容列宽
  ]

  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '视频内容分析')

  // 导出文件
  XLSX.writeFile(wb, '视频内容分析.xlsx')
}

// 导出为PDF
const exportToPDF = async () => {
  const doc = new jsPDF()
  
  // 设置标题
  doc.setFontSize(16)
  doc.text('视频内容分析', 14, 15)

  // 设置表格内容
  doc.setFontSize(10)
  const tableData = sections.value.map(section => [
    section.id.toString(),
    section.title,
    section.content
  ])

  doc.autoTable({
    startY: 25,
    head: [['序号', '标题', '内容']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 40 },
      2: { cellWidth: 'auto' }
    }
  })

  // 保存文件
  doc.save('视频内容分析.pdf')
}
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}

.v-text-field :deep(.v-field__input) {
  font-size: 14px;
}

.gap-2 {
  gap: 8px;
}

.v-data-table {
  background: transparent;
}

.v-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>