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

    async FindCustomerById({ id }){
        try {
            const existingCustomer = await CustomerModel.findById(id);
            
            if (!existingCustomer) {
                throw new NotFoundError(`Customer not found with ID: ${id}`);
            }
            
            return existingCustomer;
        } catch (error) {
            logger.error(`Error finding customer by ID: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            if (error.name === 'CastError') {
                throw new NotFoundError(`Invalid customer ID: ${id}`);
            }
            
            throw new DatabaseError(`Failed to find customer by ID: ${error.message}`);
        }
    }

    async Wishlist(customerId){

        const profile = await CustomerModel.findById(customerId).populate('wishlist');
       
        return profile.wishlist;
    }

    async AddWishlistItem(customerId, { _id, name, desc, price, available, banner}){
        
        const product = {
            _id, name, desc, price, available, banner
        };

        const profile = await CustomerModel.findById(customerId).populate('wishlist');
       
        if(profile){

             let wishlist = profile.wishlist;
  
            if(wishlist.length > 0){
                let isExist = false;
                wishlist.map(item => {
                    if(item._id.toString() === product._id.toString()){
                       const index = wishlist.indexOf(item);
                       wishlist.splice(index,1);
                       isExist = true;
                    }
                });

                if(!isExist){
                    wishlist.push(product);
                }

            }else{
                wishlist.push(product);
            }

            profile.wishlist = wishlist;
        }

        const profileResult = await profile.save();      

        return profileResult.wishlist;

    }


    async AddCartItem(customerId, { _id, name, price, banner},qty, isRemove){
        try {
            const customer = await this.FindCustomerById(customerId);
            
            if (!customer) {
                throw new NotFoundError(`Customer not found with ID: ${customerId}`);
            }
            
            const cartItem = {
                product: { _id, name, price, banner },
                unit: qty,
            };
          
            let cartItems = customer.cart;
            
            if(cartItems.length > 0){
                let isExist = false;
                 cartItems.map(item => {
                    if(item.product._id.toString() === _id.toString()){

                        if(isRemove){
                            cartItems.splice(cartItems.indexOf(item), 1);
                        }else{
                            item.unit = qty;
                        }
                        isExist = true;
                    }
                });

                if(!isExist){
                    cartItems.push(cartItem);
                } 
            }else{
                cartItems.push(cartItem);
            }

            customer.cart = cartItems;

            return await customer.save();
        } catch (error) {
            logger.error(`Error adding cart item: ${error.message}`);
            
            if (error.name === 'NotFoundError' || error.name === 'ValidationError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to add cart item: ${error.message}`);
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

}

module.exports = CustomerRepository;
