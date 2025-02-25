const mongoose = require('mongoose');
const { ProductModel } = require("../models");
const { NotFoundError, DatabaseError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('product-repository');

//Dealing with data base operations
class ProductRepository {


    async CreateProduct({ name, desc, type, unit,price, available, suplier, banner }){
        try {
            const product = new ProductModel({
                name, desc, type, unit,price, available, suplier, banner
            })

            const productResult = await product.save();
            return productResult;
        } catch (error) {
            logger.error(`Error creating product: ${error.message}`);
            throw error;
        }
    }


     async Products(){
        try {
            return await ProductModel.find();
        } catch (error) {
            logger.error(`Error getting products: ${error.message}`);
            throw new DatabaseError(`Failed to get products: ${error.message}`);
        }
    }
   
    async FindById(id){
        try {
            const existingProduct = await ProductModel.findById(id);
            
            if (!existingProduct) {
                throw new NotFoundError(`Product not found with ID: ${id}`);
            }
            
            return existingProduct;
        } catch (error) {
            logger.error(`Error finding product by ID: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            if (error.name === 'CastError') {
                throw new NotFoundError(`Invalid product ID: ${id}`);
            }
            
            throw new DatabaseError(`Failed to find product by ID: ${error.message}`);
        }
    }

    async FindByCategory(category){
        try {
            const products = await ProductModel.find({ type: category});
            
            if (!products || products.length === 0) {
                throw new NotFoundError(`No products found in category: ${category}`);
            }
            
            return products;
        } catch (error) {
            logger.error(`Error finding products by category: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to find products by category: ${error.message}`);
        }
    }

    async FindSelectedProducts(selectedIds){
        try {
            const products = await ProductModel.find({
                _id: { $in: selectedIds }
            });
            
            if (!products || products.length === 0) {
                throw new NotFoundError('No products found with the provided IDs');
            }
            
            return products;
        } catch (error) {
            logger.error(`Error finding selected products: ${error.message}`);
            
            if (error.name === 'NotFoundError') {
                throw error;
            }
            
            throw new DatabaseError(`Failed to find selected products: ${error.message}`);
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

module.exports = ProductRepository;
