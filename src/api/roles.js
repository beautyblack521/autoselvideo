import request from '@/utils/request'

export const getRoles = (params) => {
  return request({
    url: '/api/v1/roles',
    method: 'get',
    params
  })
}

export const createRole = (data) => {
  return request({
    url: '/api/v1/roles',
    method: 'post',
    data
  })
}

export const updateRole = (id, data) => {
  return request({
    url: `/api/v1/roles/${id}`,
    method: 'put',
    data
  })
}

export const deleteRole = (id) => {
  return request({
    url: `/api/v1/roles/${id}`,
    method: 'delete'
  })
} 