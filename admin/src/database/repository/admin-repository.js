const { AdminModel, RoleModel } = require('../models');
const { NotFoundError, ValidationError, DatabaseError, AuthenticationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const { FEATURES } = require('../../config');

const logger = createLogger('admin-repository');

class AdminRepository {
    async CreateAdmin({ name, email, password, roleId, permissions = [] }) {
        try {
            // Check if admin already exists
            const existingAdmin = await AdminModel.findOne({ email });
            
            if (existingAdmin) {
                throw new ValidationError('Email already registered');
            }
            
            // Check if we've reached the maximum number of admin users (free version limitation)
            const adminCount = await AdminModel.countDocuments();
            if (adminCount >= FEATURES.MAX_ADMIN_USERS) {
                throw new ValidationError(`Maximum number of admin users (${FEATURES.MAX_ADMIN_USERS}) reached. Upgrade to premium for unlimited admin users.`);
            }
            
            // Validate role
            const role = await RoleModel.findById(roleId);
            if (!role) {
                throw new ValidationError('Invalid role');
            }
            
            const admin = new AdminModel({
                name,
                email,
                password,
                role: roleId,
                permissions
            });
            
            return await admin.save();
        } catch (error) {
            logger.error(`Error creating admin: ${error.message}`);
            
            if (error instanceof ValidationError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to create admin: ${error.message}`);
        }
    }
    
    async FindAdmin({ email }) {
        try {
            const admin = await AdminModel.findOne({ email }).populate('role');
            return admin;
        } catch (error) {
            logger.error(`Error finding admin: ${error.message}`);
            throw new DatabaseError(`Failed to find admin: ${error.message}`);
        }
    }
    
    async FindAdminById(id) {
        try {
            const admin = await AdminModel.findById(id).populate('role');
            
            if (!admin) {
                throw new NotFoundError(`Admin not found with ID: ${id}`);
            }
            
            return admin;
        } catch (error) {
            logger.error(`Error finding admin by ID: ${error.message}`);
            
            if (error instanceof NotFoundError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to find admin: ${error.message}`);
        }
    }
    
    async UpdateAdmin(id, updates) {
        try {
            const admin = await AdminModel.findById(id);
            
            if (!admin) {
                throw new NotFoundError(`Admin not found with ID: ${id}`);
            }
            
            // If updating email, check if it's already in use
            if (updates.email && updates.email !== admin.email) {
                const existingAdmin = await AdminModel.findOne({ email: updates.email });
                if (existingAdmin) {
                    throw new ValidationError('Email already in use');
                }
            }
            
            // If updating role, validate it
            if (updates.role) {
                const role = await RoleModel.findById(updates.role);
                if (!role) {
                    throw new ValidationError('Invalid role');
                }
            }
            
            // Update fields
            Object.keys(updates).forEach(key => {
                admin[key] = updates[key];
            });
            
            return await admin.save();
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
            const admin = await AdminModel.findById(id);
            
            if (!admin) {
                throw new NotFoundError(`Admin not found with ID: ${id}`);
            }
            
            return await AdminModel.findByIdAndDelete(id);
        } catch (error) {
            logger.error(`Error deleting admin: ${error.message}`);
            
            if (error instanceof NotFoundError) {
                throw error;
            }
            
            throw new DatabaseError(`Failed to delete admin: ${error.message}`);
        }
    }
    
    async GetAllAdmins(query = {}) {
        try {
            const { page = 1, limit = 10, sort = '-createdAt', ...filters } = query;
            
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                sort
            };
            
            const admins = await AdminModel.find(filters)
                .populate('role')
                .sort(sort)
                .skip((options.page - 1) * options.limit)
                .limit(options.limit);
                
            const total = await AdminModel.countDocuments(filters);
            
            return {
                admins,
                pagination: {
                    total,
                    page: options.page,
                    limit: options.limit,
                    pages: Math.ceil(total / options.limit)
                }
            };
        } catch (error) {
            logger.error(`Error getting all admins: ${error.message}`);
            throw new DatabaseError(`Failed to get admins: ${error.message}`);
        }
    }
    
    async CreateRole({ name, description, permissions, isDefault = false }) {
        try {
            // Check if role already exists
            const existingRole = await RoleModel.findOne({ name });
            
            if (existingRole) {
                throw new ValidationError('Role name already exists');
            }
            
            const role = new RoleModel({
                name,
                description,
                permissions,
                isDefault
            });
            
            return await role.save();
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
            return await RoleModel.find();
        } catch (error) {
            logger.error(`Error getting all roles: ${error.message}`);
            throw new DatabaseError(`Failed to get roles: ${error.message}`);
        }
    }
    
    async UpdateLastLogin(id) {
        try {
            return await AdminModel.findByIdAndUpdate(
                id,
                { lastLogin: new Date() },
                { new: true }
            );
        } catch (error) {
            logger.error(`Error updating last login: ${error.message}`);
            throw new DatabaseError(`Failed to update last login: ${error.message}`);
        }
    }
}

module.exports = AdminRepository; 