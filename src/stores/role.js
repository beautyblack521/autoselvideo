import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as roleApi from '@/api/roles'

export const useRoleStore = defineStore('role', () => {
  const roles = ref([])

  // 获取角色列表
  const fetchRoles = async () => {
    const response = await roleApi.getRoles()
    roles.value = response
    return response
  }

  // 创建角色
  const createRole = async (roleData) => {
    const response = await roleApi.createRole(roleData)
    await fetchRoles()
    return response
  }

  // 更新角色
  const updateRole = async (id, roleData) => {
    const response = await roleApi.updateRole(id, roleData)
    await fetchRoles()
    return response
  }

  // 删除角色
  const deleteRole = async (id) => {
    const response = await roleApi.deleteRole(id)
    await fetchRoles()
    return response
  }

  return {
    roles,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole
  }
}) 