const { TenantRepository } = require('../database');
const { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require('../utils');
const { APIError, BadRequestError } = require('../utils/app-errors');
const CircuitBreaker = require('../utils/circuit-breaker');
const logger = require('../utils/logger');

// All Business logic will be here
class TenantService {
    constructor() {
        this.repository = new TenantRepository();
        this.circuitBreaker = new CircuitBreaker();
    }

    async SignUp(userInputs) {
        const { name, email, password, phone, companyName, businessType, address } = userInputs;
        
        try {
            // Use circuit breaker for database operations
            return await this.circuitBreaker.execute(async () => {
                // Check if tenant already exists
                const existingTenant = await this.repository.FindTenant({ email });
                
                if (existingTenant) {
                    throw new BadRequestError('Tenant with this email already exists');
                }

                // Create salt and hash password
                const salt = await GenerateSalt();
                const hashedPassword = await GeneratePassword(password, salt);
                
                const tenant = await this.repository.CreateTenant({
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                    companyName,
                    businessType,
                    address
                });

                logger.info(`New tenant created: ${tenant._id}`);
                const token = await GenerateSignature({ email: tenant.email, _id: tenant._id });
                
                return FormateData({ id: tenant._id, token });
            });
        } catch (err) {
            logger.error(`Error in SignUp: ${err.message}`);
            throw new APIError('Data Not found', err);
        }
    }

    async SignIn(userInputs) {
        const { email, password } = userInputs;
        
        try {
            return await this.circuitBreaker.execute(async () => {
                const existingTenant = await this.repository.FindTenant({ email });

                if (!existingTenant) {
                    throw new BadRequestError('Tenant not found with this email');
                }
                
                const validPassword = await ValidatePassword(password, existingTenant.password);
                
                if (!validPassword) {
                    logger.warn(`Failed login attempt for tenant: ${email}`);
                    throw new BadRequestError('Invalid password');
                }
                
                logger.info(`Tenant logged in: ${existingTenant._id}`);
                const token = await GenerateSignature({ email: existingTenant.email, _id: existingTenant._id });
                
                return FormateData({ id: existingTenant._id, token });
            });
        } catch (err) {
            logger.error(`Error in SignIn: ${err.message}`);
            throw new APIError('Data Not found', err);
        }
    }

    async GetTenantProfile(id) {
        try {
            const tenant = await this.repository.FindTenantById(id);
            
            if (!tenant) {
                throw new BadRequestError('Tenant not found');
            }
            
            return FormateData(tenant);
        } catch (err) {
            throw new APIError('Data Not found', err);
        }
    }

    async UpdateTenantProfile(id, updates) {
        try {
            // Don't allow updating email or password through this method
            const { email, password, ...allowedUpdates } = updates;
            
            const updatedTenant = await this.repository.UpdateTenant(id, allowedUpdates);
            
            return FormateData(updatedTenant);
        } catch (err) {
            throw new APIError('Error updating tenant profile', err);
        }
    }

    async GetTenants(query, options) {
        try {
            const tenants = await this.repository.GetTenants(query, options);
            return FormateData(tenants);
        } catch (err) {
            throw new APIError('Error fetching tenants', err);
        }
    }

    async VerifyTenant(id) {
        try {
            const tenant = await this.repository.UpdateTenant(id, { isVerified: true });
            return FormateData(tenant);
        } catch (err) {
            throw new APIError('Error verifying tenant', err);
        }
    }

    async DeactivateTenant(id) {
        try {
            const tenant = await this.repository.UpdateTenant(id, { isActive: false });
            return FormateData(tenant);
        } catch (err) {
            throw new APIError('Error deactivating tenant', err);
        }
    }

    async ChangeSubscription(id, plan, expiryDate) {
        try {
            const tenant = await this.repository.UpdateTenant(id, { 
                subscriptionPlan: plan,
                subscriptionStatus: 'active',
                subscriptionExpiry: expiryDate
            });
            return FormateData(tenant);
        } catch (err) {
            throw new APIError('Error changing subscription', err);
        }
    }

    async SubscribeEvents(payload) {
        const { event, data } = payload;

        switch(event) {
            case 'CUSTOMER_CREATED':
                // Handle customer creation event if needed
                break;
            default:
                break;
        }
    }
}

module.exports = TenantService; 