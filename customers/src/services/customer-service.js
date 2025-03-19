const { CustomerRepository } = require("../database");
const { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require('../utils');
const { NotFoundError, ValidationError, DatabaseError, AuthenticationError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const bcrypt = require('bcrypt');

// Add this line to define the logger
const logger = createLogger('customer-service');

// All Business logic will be here
class CustomerService {

    constructor(){
        this.repository = new CustomerRepository();
    }

    async SignIn(userInputs){
        const { email, password } = userInputs;
        
        try {
            console.log(`Attempting to sign in user: ${email}`);
            
            // Use select('+password') to include the password field which is normally excluded
            const existingCustomer = await this.repository.FindCustomer({ email });
            
            if (!existingCustomer) {
                console.log(`No user found with email: ${email}`);
                throw new ValidationError('Invalid email or password');
            }
            
            console.log(`User found: ${existingCustomer._id}`);
            console.log(`Stored password hash: ${existingCustomer.password}`);
            
            // Trim password to remove any leading/trailing spaces
            const trimmedPassword = password.trim();
            
            // Validate password using bcrypt compare
            const isValid = await ValidatePassword(trimmedPassword, existingCustomer.password);
            console.log(`Password validation result: ${isValid}`);
            
            if (!isValid) {
                console.log("Password validation failed");
                throw new ValidationError('Invalid email or password');
            }
            
            console.log("Password validation successful");
            
            const token = await GenerateSignature({
                email: existingCustomer.email,
                _id: existingCustomer._id,
                isActive: existingCustomer.isActive
            });
            
            // Return more user details in the response
            return FormateData({ 
                id: existingCustomer._id,
                token,
                email: existingCustomer.email,
                phone: existingCustomer.phone,
                cart: existingCustomer.cart || [],
                wishlist: existingCustomer.wishlist || [],
                orders: existingCustomer.orders || [],
                address: existingCustomer.address || [],
                isActive: existingCustomer.isActive
            });
        } catch (err) {
            logger.error(`Error during sign in: ${err.message}`);
            throw err;
        }
    }

    async SignUp(userInputs){
        const { email, password, phone } = userInputs;
    
        try {
            // Check if user exists
            const existingCustomer = await this.repository.FindCustomer({ email });
            
            if (existingCustomer) {
                throw new ValidationError('Email already exists');
            }
            
            // Trim password to remove any leading/trailing spaces
            const trimmedPassword = password.trim();
            
            // Hash password directly - no salt needed separately
            const hashedPassword = await GeneratePassword(trimmedPassword);
            console.log("Generated hash during signup:", hashedPassword);
            
            // Create customer without salt field
            const customer = await this.repository.CreateCustomer({ 
                email, 
                password: hashedPassword,
                phone
            });
            
            const token = await GenerateSignature({ 
                email: customer.email, 
                _id: customer._id 
            });
            
            // Return more user details in the response
            return FormateData({ 
                id: customer._id, 
                email: customer.email,
                phone: customer.phone,
                cart: customer.cart || [],
                wishlist: customer.wishlist || [],
                orders: customer.orders || [],
                address: customer.address || [],
                isActive: customer.isActive,
                token 
            });
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
            if (!customerId) {
                logger.error('Customer ID is undefined in GetWishlist');
                throw new ValidationError('Customer ID is required');
            }
            
            logger.info(`Getting wishlist for customer: ${customerId}`);
            
            const customer = await this.repository.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            return FormateData({
                wishlist: customer.wishlist || []
            });
        } catch (err) {
            logger.error(`Error getting wishlist: ${err.message}`);
            throw err;
        }
    }

    async AddToWishlist(customerId, productData){
        try {
            if (!customerId) {
                throw new ValidationError('Customer ID is required');
            }
            
            if (!productData) {
                throw new ValidationError('Product data is required');
            }
            
            // If product ID is provided, verify it exists
            if (productData._id) {
                const { ProductModel } = require('../database/models');
                const existingProduct = await ProductModel.findById(productData._id);
                
                if (!existingProduct) {
                    throw new NotFoundError(`Product with ID ${productData._id} not found`);
                }
                
                console.log(`Found existing product: ${existingProduct._id}`);
                
                // Use the existing product for the wishlist
                const customer = await this.repository.AddWishlistItem(customerId, existingProduct);
                
                return FormateData({
                    wishlist: customer.wishlist || [],
                    message: 'Product added to wishlist successfully'
                });
            } 
            // If no product ID, check if product with same name exists
            else if (productData.name) {
                const { ProductModel } = require('../database/models');
                const existingProduct = await ProductModel.findOne({ name: productData.name });
                
                if (existingProduct) {
                    console.log(`Found existing product with name ${productData.name}: ${existingProduct._id}`);
                    
                    // Use the existing product for the wishlist
                    const customer = await this.repository.AddWishlistItem(customerId, existingProduct);
                    
                    return FormateData({
                        wishlist: customer.wishlist || [],
                        message: 'Product added to wishlist successfully'
                    });
                } else {
                    // Create a new product
                    const newProduct = new ProductModel({
                        name: productData.name,
                        description: productData.description || '',
                        banner: productData.banner || '',
                        price: productData.price || 0,
                        available: productData.available !== undefined ? productData.available : true
                    });
                    
                    await newProduct.save();
                    console.log(`Created new product: ${newProduct._id}`);
                    
                    // Add the new product to the wishlist
                    const customer = await this.repository.AddWishlistItem(customerId, newProduct);
                    
                    return FormateData({
                        wishlist: customer.wishlist || [],
                        message: 'New product created and added to wishlist successfully'
                    });
                }
            } else {
                throw new ValidationError('Product name is required');
            }
        } catch (error) {
            logger.error(`Error adding to wishlist: ${error.message}`);
            
            if (error.name === 'NotFoundError' || error.name === 'ValidationError') {
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
