const mongoose = require('mongoose');
const { ProductModel } = require("../models");
const { NotFoundError, DatabaseError, ValidationError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('product-repository');

//Dealing with data base operations
class ProductRepository {


    async CreateProduct({ name, desc, type, unit, price, available, suplier, banner }) {
        try {
            // Set a default banner URL if none is provided or if it's invalid
            const defaultBanner = "https://via.placeholder.com/300x200";
            
            // Check if banner is a valid URL, if not use the default
            let bannerUrl = banner;
            try {
                if (!banner || banner.trim() === '') {
                    bannerUrl = defaultBanner;
                } else {
                    // Try to create a URL object to validate
                    new URL(banner);
                    // If it doesn't throw an error, it's valid
                }
            } catch (error) {
                // If URL constructor throws an error, use the default
                bannerUrl = defaultBanner;
                console.log(`Invalid banner URL provided, using default: ${defaultBanner}`);
            }
            
            // Set default supplier if not provided
            const defaultSupplier = "Unknown Supplier";
            const productSupplier = suplier || defaultSupplier;
            
            const product = new ProductModel({
                name, 
                desc, 
                type, 
                unit,
                price, 
                available, 
                suplier: productSupplier, 
                banner: bannerUrl
            });

            const productResult = await product.save();
            return productResult;
        } catch (error) {
            logger.error(`Error creating product: ${error.message}`);
            
            if (error.name === 'ValidationError') {
                throw new ValidationError(error.message);
            }
            
            throw new DatabaseError(`Failed to create product: ${error.message}`);
        }
    }


     async Products(){
        try {
            return await ProductModel.find();
        } catch (error) {
            logger.error(`Error fetching products: ${error.message}`);
            throw new DatabaseError(`Failed to fetch products: ${error.message}`);
        }
    }
   
    async FindById(id){
        try {
            if (!id) {
                throw new ValidationError('Product ID is required');
            }
            
            // Validate that the ID is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ValidationError('Invalid product ID format');
            }
            
            const existingProduct = await ProductModel.findById(id);
            
            if (!existingProduct) {
                throw new NotFoundError(`Product not found with ID: ${id}`);
            }
            
            return existingProduct;
        } catch (error) {
            logger.error(`Error finding product by ID: ${error.message}`);
            throw error;
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
