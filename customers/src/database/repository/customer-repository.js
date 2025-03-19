const mongoose = require('mongoose');
const { CustomerModel, AddressModel } = require('../models');
const { NotFoundError, ValidationError, DatabaseError, AuthenticationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('customer-repository');

//Dealing with data base operations
class CustomerRepository {

    async CreateCustomer({ email, password, phone, salt }){
        console.log("Create customer request received", { email, password, phone, salt });
        try {
            // Check if customer already exists
            const existingCustomer = await CustomerModel.findOne({ email });
            
            if (existingCustomer) {
                throw new ValidationError('Email already registered');
            }
            
            const customer = new CustomerModel({
                email,
                password,
                salt,
                phone,
                address: []
            })

            const customerResult = await customer.save();
            return customerResult;
        } catch (error) {
            logger.error(`Error creating customer: ${error.message}`);
            
            if (error.name === 'ValidationError') {
                throw error;
            }
            
            throw error;
        }
    }
    
    async CreateAddress({ _id, street, postalCode, city, country}){
        
        const profile = await CustomerModel.findById(_id);
        
        if(profile){
            
            const newAddress = new AddressModel({
                street,
                postalCode,
                city,
                country
            })

            await newAddress.save();

            profile.address.push(newAddress);
        }

        return await profile.save();
    }

    async FindCustomer({ email }){
        try {
            console.log(`Attempting to find customer with email: ${email}`);
            const existingCustomer = await CustomerModel.findOne({ email }).select('+password +salt');
            
            console.log(`Customer search result:`, existingCustomer);
            return existingCustomer; // Just return the result, don't throw error if not found
        } catch (error) {
            logger.error(`Error finding customer: ${error.message}`);
            throw error;
        }
    }

    async FindCustomerById(id){
        try {
            console.log(`Attempting to find customer with ID: ${id}`);
            
            if (!id) {
                throw new ValidationError('Customer ID is required');
            }
            
            // Validate that the ID is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ValidationError('Invalid customer ID format');
            }
            
            const existingCustomer = await CustomerModel.findById(id);
            
            if (!existingCustomer) {
                throw new NotFoundError(`Customer not found with ID: ${id}`);
            }
            
            console.log(`Customer found with ID: ${id}`);
            return existingCustomer;
        } catch (error) {
            logger.error(`Error finding customer by ID: ${error.message}`);
            throw error;
        }
    }

    async Wishlist(customerId){

        const profile = await CustomerModel.findById(customerId).populate('wishlist');
       
        return profile.wishlist;
    }

    async AddWishlistItem(customerId, productData){
        try {
            console.log(`Adding product to wishlist for customer: ${customerId}`, productData);
            
            if (!productData || !productData.name) {
                throw new ValidationError('Product name is required');
            }
            
            const customer = await this.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            // Initialize wishlist if it doesn't exist
            if (!customer.wishlist) {
                customer.wishlist = [];
            }
            
            // Find or create the product
            let product;
            
            // If product has an ID, try to find it
            if (productData._id && mongoose.Types.ObjectId.isValid(productData._id)) {
                // Try to find existing product
                product = await mongoose.model('product').findById(productData._id);
            }
            
            // If product doesn't exist, create a new one
            if (!product) {
                // Create a new product model if it doesn't exist
                if (!mongoose.models.product) {
                    const ProductSchema = new mongoose.Schema({
                        name: String,
                        description: String,
                        banner: String,
                        price: Number,
                        available: Boolean
                    });
                    
                    mongoose.model('product', ProductSchema);
                }
                
                // Create a new product
                product = new mongoose.model('product')({
                    name: productData.name,
                    description: productData.description || '',
                    banner: productData.banner || '',
                    price: productData.price || 0,
                    available: productData.available !== undefined ? productData.available : true
                });
                
                // Save the product
                await product.save();
                console.log(`Created new product with ID: ${product._id}`);
            }
            
            // Check if product already exists in wishlist
            const existingProductIndex = customer.wishlist.findIndex(
                item => item.toString() === product._id.toString()
            );
            
            // If product exists, remove it (toggle behavior)
            if (existingProductIndex >= 0) {
                customer.wishlist.splice(existingProductIndex, 1);
                console.log(`Removed product ${product._id} from wishlist`);
            } else {
                // Add product to wishlist
                customer.wishlist.push(product._id);
                console.log(`Added product ${product._id} to wishlist`);
            }
            
            // Save the updated customer
            await customer.save();
            
            return customer;
        } catch (error) {
            logger.error(`Error adding product to wishlist: ${error.message}`);
            throw error;
        }
    }

    async AddCartItem(customerId, product, qty){
        try {
            console.log(`Adding product to cart for customer: ${customerId}`, product);
            
            if (!product || !product._id) {
                throw new ValidationError('Valid product with ID is required');
            }
            
            const customer = await this.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            // Initialize cart if it doesn't exist
            if (!customer.cart) {
                customer.cart = [];
            }
            
            const cartItem = {
                product: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    banner: product.banner || 'https://via.placeholder.com/150'
                },
                unit: qty || 1
            };
            
            // Check if product already exists in cart
            const existingItemIndex = customer.cart.findIndex(
                item => item.product._id.toString() === product._id.toString()
            );
            
            // If product exists, update quantity
            if (existingItemIndex >= 0) {
                customer.cart[existingItemIndex].unit = qty;
                console.log(`Updated product ${product._id} quantity in cart to ${qty}`);
            } else {
                // Add product to cart
                customer.cart.push(cartItem);
                console.log(`Added product ${product._id} to cart`);
            }
            
            // Save the updated customer
            await customer.save();
            
            return customer;
        } catch (error) {
            logger.error(`Error adding product to cart: ${error.message}`);
            throw error;
        }
    }

    async RemoveCartItem(customerId, productId){
        try {
            console.log(`Removing product ${productId} from cart for customer: ${customerId}`);
            
            if (!productId) {
                throw new ValidationError('Product ID is required');
            }
            
            const customer = await this.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            // Initialize cart if it doesn't exist
            if (!customer.cart) {
                customer.cart = [];
                return customer;
            }
            
            // Find the product in the cart
            const productIndex = customer.cart.findIndex(
                item => item.product._id.toString() === productId.toString()
            );
            
            // If product exists in cart, remove it
            if (productIndex >= 0) {
                customer.cart.splice(productIndex, 1);
                console.log(`Removed product ${productId} from cart`);
            } else {
                console.log(`Product ${productId} not found in cart`);
            }
            
            // Save the updated customer
            await customer.save();
            
            return customer;
        } catch (error) {
            logger.error(`Error removing product from cart: ${error.message}`);
            throw error;
        }
    }

    async GetCart(customerId){
        try {
            console.log(`Getting cart for customer: ${customerId}`);
            
            const customer = await this.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            return customer.cart || [];
        } catch (error) {
            logger.error(`Error getting cart: ${error.message}`);
            throw error;
        }
    }

    async AddOrderToProfile(customerId, order){
        try {
            const customer = await this.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            if(customer.orders == undefined){
                customer.orders = []
            }
            customer.orders.push(order);

            customer.cart = [];

            const customerResult = await customer.save();

            return customerResult;
        } catch (error) {
            logger.error(`Error adding order to profile: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to add order to profile: ${error.message}`);
        }
    }

    async checkConnection() {
        try {
            // Check if mongoose connection is established
            return mongoose.connection.readyState === 1; // 1 = connected
        } catch (err) {
            console.log('Database connection check failed:', err);
            return false;
        }
    }

    async RemoveWishlistItem(customerId, productId){
        try {
            console.log(`Removing product ${productId} from wishlist for customer: ${customerId}`);
            
            if (!productId) {
                throw new ValidationError('Product ID is required');
            }
            
            const customer = await this.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            // Initialize wishlist if it doesn't exist
            if (!customer.wishlist) {
                customer.wishlist = [];
                return customer;
            }
            
            // Find the product in the wishlist
            const productIndex = customer.wishlist.findIndex(
                item => item.toString() === productId.toString()
            );
            
            // If product exists in wishlist, remove it
            if (productIndex >= 0) {
                customer.wishlist.splice(productIndex, 1);
                console.log(`Removed product ${productId} from wishlist`);
            } else {
                console.log(`Product ${productId} not found in wishlist`);
            }
            
            // Save the updated customer
            await customer.save();
            
            return customer;
        } catch (error) {
            logger.error(`Error removing product from wishlist: ${error.message}`);
            throw error;
        }
    }

}

module.exports = CustomerRepository;
