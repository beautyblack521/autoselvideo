class Permissions:
    # User permissions
    VIEW_USERS = "view_users"
    CREATE_USER = "create_user"
    UPDATE_USER = "update_user"
    DELETE_USER = "delete_user"
    
    # Role permissions
    VIEW_ROLES = "view_roles"
    CREATE_ROLE = "create_role"
    UPDATE_ROLE = "update_role"
    DELETE_ROLE = "delete_role"
    
    # Log permissions
    VIEW_LOGS = "view_logs"
    
    # System permissions
    MANAGE_SYSTEM = "manage_system"
    
    @classmethod
    def all_permissions(cls) -> list:
        return [value for name, value in vars(cls).items() 
                if not name.startswith('_') and isinstance(value, str)] 