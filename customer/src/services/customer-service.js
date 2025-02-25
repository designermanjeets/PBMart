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
        try {
            const { email, password } = userInputs;
            
            const existingCustomer = await this.repository.FindCustomer({ email });
            
            if (!existingCustomer) {
                throw new AuthenticationError('Invalid email or password');
            }
            
            const validPassword = await existingCustomer.comparePassword(password);
            
            if (!validPassword) {
                throw new AuthenticationError('Invalid email or password');
            }
            
            // Update last login
            await existingCustomer.updateLastLogin();
            
            const token = await GenerateSignature({
                email: existingCustomer.email,
                _id: existingCustomer._id,
                isActive: existingCustomer.isActive
            });
            
            return FormateData({ id: existingCustomer._id, token });
        } catch (error) {
            logger.error(`Error signing in: ${error.message}`);
            throw error;
        }
    }

    async SignUp(userInputs){
        try {
            const { email, password, phone } = userInputs;
            
            // Create salt
            const salt = await GenerateSalt();
            
            // Create password
            const hashedPassword = await GeneratePassword(password, salt);
            
            const customer = await this.repository.CreateCustomer({
                email,
                password: hashedPassword,
                phone,
                salt
            });
            
            const token = await GenerateSignature({
                email: customer.email,
                _id: customer._id,
                isActive: customer.isActive
            });
            
            return FormateData({ id: customer._id, token });
        } catch (error) {
            logger.error(`Error signing up: ${error.message}`);
            
            if (error.name === 'ValidationError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to sign up: ${error.message}`);
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
        try {
            const { event, data } = payload;
            const { userId, product, qty } = data;
            
            switch (event) {
                case 'ADD_TO_WISHLIST':
                case 'REMOVE_FROM_WISHLIST':
                    this.AddToWishlist(userId, product);
                    break;
                case 'ADD_TO_CART':
                    this.ManageCart(userId, product, qty, false);
                    break;
                case 'REMOVE_FROM_CART':
                    this.ManageCart(userId, product, qty, true);
                    break;
                default:
                    break;
            }
        } catch (error) {
            logger.error(`Error subscribing to events: ${error.message}`);
        }
    }

}

module.exports = CustomerService;
