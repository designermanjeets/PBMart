const { CustomerRepository } = require("../database");
const { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require('../utils');
const { NotFoundError, ValidationError, DatabaseError, AuthenticationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('customer-service');

// All Business logic will be here
class CustomerService {

    constructor(){
        this.repository = new CustomerRepository();
    }

    async SignIn(userInputs){
        const { email, password } = userInputs;
        
        try {
            const existingCustomer = await this.repository.FindCustomer({ email });
            
            if (!existingCustomer) {
                throw new ValidationError('Invalid email or password');
            }
            
            const validPassword = await ValidatePassword(password, existingCustomer.password, existingCustomer.salt);
            
            if (!validPassword) {
                throw new ValidationError('Invalid email or password');
            }
            
            // Update last login
            if (existingCustomer.updateLastLogin) {
                await existingCustomer.updateLastLogin();
            }
            
            const token = await GenerateSignature({
                email: existingCustomer.email,
                _id: existingCustomer._id,
                isActive: existingCustomer.isActive
            });
            
            return FormateData({ id: existingCustomer._id, token });
        } catch (err) {
            logger.error(`Error during sign in: ${err.message}`);
            throw err;
        }
    }

    async SignUp(userInputs){
        const { email, password, phone } = userInputs;
    
        console.log('Signup request received:', { email, phone });
        
        try {
            // Check if user already exists
            const existingCustomer = await this.repository.FindCustomer({ email });
            
            if (existingCustomer) {
                throw new ValidationError('Email already exists');
            }
    
            console.log('No existing customer found, proceeding with signup');
    
            // Create salt
            const salt = await GenerateSalt();
            
            // Hash password
            const hashedPassword = await GeneratePassword(password, salt);
            
            // Create customer
            const customer = await this.repository.CreateCustomer({ 
                email, 
                password: hashedPassword,
                phone,
                salt 
            });
    
            // Generate token
            const token = await GenerateSignature({ 
                email: customer.email, 
                _id: customer._id 
            });
    
            console.log('Customer created successfully:', customer._id);
    
            return FormateData({ id: customer._id, token });
        } catch (err) {
            logger.error(`Error during sign up: ${err.message}`);
            throw err;
        }
    }

    async AddNewAddress(customerId, userInputs){
        try {
            const { street, postalCode, city, country } = userInputs;
            
            const address = await this.repository.AddNewAddress(customerId, {
                street,
                postalCode,
                city,
                country
            });
            
            return FormateData(address);
        } catch (error) {
            logger.error(`Error adding new address: ${error.message}`);
            
            if (error.name === 'NotFoundError' || error.name === 'ValidationError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to add new address: ${error.message}`);
        }
    }

    async GetProfile(customerId){
        try {
            const customer = await this.repository.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            return FormateData(customer);
        } catch (error) {
            logger.error(`Error getting profile: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to get profile: ${error.message}`);
        }
    }

    async GetShoppingDetails(customerId){
        try {
            const customer = await this.repository.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            return FormateData(customer);
        } catch (error) {
            logger.error(`Error getting shopping details: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to get shopping details: ${error.message}`);
        }
    }

    async GetWishlist(customerId){
        try {
            const customer = await this.repository.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            return FormateData(customer.wishlist);
        } catch (error) {
            logger.error(`Error getting wishlist: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to get wishlist: ${error.message}`);
        }
    }

    async AddToWishlist(customerId, product){
        try {
            const customer = await this.repository.AddWishlistItem(customerId, product);
            
            return FormateData(customer.wishlist);
        } catch (error) {
            logger.error(`Error adding to wishlist: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to add to wishlist: ${error.message}`);
        }
    }

    async RemoveFromWishlist(customerId, productId) {
        try {
            const customer = await this.repository.RemoveWishlistItem(customerId, productId);
            
            return FormateData(customer.wishlist);
        } catch (error) {
            logger.error(`Error removing from wishlist: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to remove from wishlist: ${error.message}`);
        }
    }

    async ManageCart(customerId, product, qty, isRemove){
        try {
            if (isRemove) {
                const customer = await this.repository.RemoveCartItem(customerId, product._id);
                return FormateData(customer);
            }
            
            const customer = await this.repository.AddCartItem(customerId, product, qty);
            return FormateData(customer);
        } catch (error) {
            logger.error(`Error managing cart: ${error.message}`);
            
            if (error.name === 'NotFoundError' || error.name === 'ValidationError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to manage cart: ${error.message}`);
        }
    }

    async ManageOrder(customerId, order){
        try {
            const customer = await this.repository.AddOrderToProfile(customerId, order);
            return FormateData(customer);
        } catch (error) {
            logger.error(`Error managing order: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to manage order: ${error.message}`);
        }
    }

    async SubscribeEvents(payload){
        logger.info('Subscribing to events');
        
        const { event, data } = payload;
        
        switch(event) {
            case 'ADD_TO_WISHLIST':
            case 'REMOVE_FROM_WISHLIST':
            case 'ADD_TO_CART':
            case 'REMOVE_FROM_CART':
            case 'CREATE_ORDER':
                this.repository.ManageCart(data.userId, data.product, data.qty, event);
                break;
            default:
                break;
        }
    }

}

module.exports = CustomerService;
