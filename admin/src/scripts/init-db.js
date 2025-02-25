const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { AdminModel, RoleModel } = require('../database/models');
const { DB_URL } = require('../config');

const initializeDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to database');
    
    // Check if roles already exist
    const rolesCount = await RoleModel.countDocuments();
    
    if (rolesCount === 0) {
      console.log('Creating default roles...');
      
      // Create super admin role
      const superAdminRole = new RoleModel({
        name: 'Super Admin',
        description: 'Full access to all system features',
        permissions: [
          'create_admin',
          'view_admins',
          'update_admin',
          'delete_admin',
          'manage_roles',
          'view_roles',
          'view_dashboard',
          'view_analytics',
          'generate_reports',
          'view_customers',
          'update_customer',
          'delete_customer',
          'manage_system_settings'
        ],
        isDefault: false
      });
      
      await superAdminRole.save();
      
      // Create admin role
      const adminRole = new RoleModel({
        name: 'Admin',
        description: 'Administrative access with some restrictions',
        permissions: [
          'view_admins',
          'view_roles',
          'view_dashboard',
          'view_analytics',
          'view_customers',
          'update_customer'
        ],
        isDefault: true
      });
      
      await adminRole.save();
      
      console.log('Default roles created');
      
      // Create default admin user
      const adminCount = await AdminModel.countDocuments();
      
      if (adminCount === 0) {
        console.log('Creating default admin user...');
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const admin = new AdminModel({
          name: 'Admin User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: superAdminRole._id,
          permissions: []
        });
        
        await admin.save();
        
        console.log('Default admin user created');
      }
    } else {
      console.log('Database already initialized');
    }
    
    console.log('Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase(); 