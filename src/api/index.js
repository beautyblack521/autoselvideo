import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export const generateContent = async (data) => {
  return await api.post('/generate', data)
}

export const updateContent = async (id, content) => {
  return await api.post(`/content/${id}`, { content })
}

export const downloadVideo = async (url) => {
  return await api.post('/download', { url })
}

export const exportFile = async (type, data) => {
  return await api.post(`/export/${type}`, data)
} 