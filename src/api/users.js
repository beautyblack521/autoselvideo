import request from '@/utils/request'

export const getUsers = (params) => {
  return request({
    url: '/api/v1/users',
    method: 'get',
    params
  })
}

export const createUser = (data) => {
  return request({
    url: '/api/v1/users',
    method: 'post',
    data
  })
}

export const updateUser = (id, data) => {
  return request({
    url: `/api/v1/users/${id}`,
    method: 'put',
    data
  })
}

export const deleteUser = (id) => {
  return request({
    url: `/api/v1/users/${id}`,
    method: 'delete'
  })
} 