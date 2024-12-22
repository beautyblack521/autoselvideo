export const Permissions = {
  // 用户权限
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',

  // 角色权限
  VIEW_ROLES: 'view_roles',
  CREATE_ROLE: 'create_role',
  UPDATE_ROLE: 'update_role',
  DELETE_ROLE: 'delete_role',

  // 日志权限
  VIEW_LOGS: 'view_logs',

  // 系统权限
  MANAGE_SYSTEM: 'manage_system'
}

// 权限文本映射
export const PermissionTexts = {
  [Permissions.VIEW_USERS]: '查看用户',
  [Permissions.CREATE_USER]: '创建用户',
  [Permissions.UPDATE_USER]: '编辑用户',
  [Permissions.DELETE_USER]: '删除用户',
  
  [Permissions.VIEW_ROLES]: '查看角色',
  [Permissions.CREATE_ROLE]: '创建角色',
  [Permissions.UPDATE_ROLE]: '编辑角色',
  [Permissions.DELETE_ROLE]: '删除角色',
  
  [Permissions.VIEW_LOGS]: '查看日志',
  [Permissions.MANAGE_SYSTEM]: '系统管理'
} 