const AdminRepository = require('../database/repository/admin-repository');
const { generateToken, validateToken, generateRefreshToken } = require('../utils/token');
const { NotFoundError, ValidationError, DatabaseError, AuthenticationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const logger = createLogger('admin-service');

class AdminService {
    constructor() {
        this.repository = new AdminRepository();
    }
    
    async SignIn(inputs) {
        try {
            const { email, password } = inputs;
            
            const admin = await this.repository.FindAdmin({ email });
            
            if (!admin) {
                throw new AuthenticationError('Invalid email or password');
            }
            
            const validPassword = await admin.comparePassword(password);
            
            if (!validPassword) {
                throw new AuthenticationError('Invalid email or password');
            }
            
            // Update last login
            await this.repository.UpdateLastLogin(admin._id);
            
            // Generate tokens
            const token = await generateToken({
                _id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role.name,
                permissions: [...admin.permissions, ...admin.role.permissions]
            });
            
            const refreshToken = await generateRefreshToken({
                _id: admin._id,
                email: admin.email
            });
            
            return { admin, token, refreshToken };
        } catch (error) {
            logger.error(`Error signing in: ${error.message}`);
            
            if (error instanceof AuthenticationError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to sign in: ${error.message}`);
        }
    }
    
    async CreateAdmin(inputs) {
        try {
            const { name, email, password, roleId, permissions } = inputs;
            
            const admin = await this.repository.CreateAdmin({
                name,
                email,
                password,
                roleId,
                permissions
            });
            
            return { admin };
        } catch (error) {
            logger.error(`Error creating admin: ${error.message}`);
            
            if (error instanceof ValidationError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to create admin: ${error.message}`);
        }
    }
    
    async GetAdminById(id) {
        try {
            const admin = await this.repository.FindAdminById(id);
            return { admin };
        } catch (error) {
            logger.error(`Error getting admin by ID: ${error.message}`);
            
            if (error instanceof NotFoundError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to get admin: ${error.message}`);
        }
    }
    
    async UpdateAdmin(id, updates) {
        try {
            const admin = await this.repository.UpdateAdmin(id, updates);
            return { admin };
        } catch (error) {
            logger.error(`Error updating admin: ${error.message}`);
            
            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to update admin: ${error.message}`);
        }
    }
    
    async DeleteAdmin(id) {
        try {
            await this.repository.DeleteAdmin(id);
            return { success: true };
        } catch (error) {
            logger.error(`Error deleting admin: ${error.message}`);
            
            if (error instanceof NotFoundError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to delete admin: ${error.message}`);
        }
    }
    
    async GetAllAdmins(query) {
        try {
            const result = await this.repository.GetAllAdmins(query);
            return result;
        } catch (error) {
            logger.error(`Error getting all admins: ${error.message}`);
            throw new DatabaseError(`Failed to get admins: ${error.message}`);
        }
    }
    
    async CreateRole(inputs) {
        try {
            const { name, description, permissions, isDefault } = inputs;
            
            const role = await this.repository.CreateRole({
                name,
                description,
                permissions,
                isDefault
            });
            
            return { role };
        } catch (error) {
            logger.error(`Error creating role: ${error.message}`);
            
            if (error instanceof ValidationError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to create role: ${error.message}`);
        }
    }
    
    async GetAllRoles() {
        try {
            const roles = await this.repository.GetAllRoles();
            return { roles };
        } catch (error) {
            logger.error(`Error getting all roles: ${error.message}`);
            throw new DatabaseError(`Failed to get roles: ${error.message}`);
        }
    }
}

module.exports = AdminService; 