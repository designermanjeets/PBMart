const { ProductRepository } = require("../database");
const { FormateData } = require("../utils");
const CircuitBreaker = require('../utils/circuit-breaker');
const logger = require('../utils/logger');

// All Business logic will be here
class ProductService {

    constructor(){
        this.repository = new ProductRepository();
        this.circuitBreaker = new CircuitBreaker();
    }
    

    async CreateProduct(productInputs){
        try {
            return await this.circuitBreaker.execute(async () => {
                const productResult = await this.repository.CreateProduct(productInputs);
                logger.info(`New product created: ${productResult._id}`);
                return FormateData(productResult);
            });
        } catch (err) {
            logger.error(`Error in CreateProduct: ${err.message}`);
            throw new APIError('Data Not found', err);
        }
    }
    
    async GetProducts(){
        try {
            return await this.circuitBreaker.execute(async () => {
                const products = await this.repository.Products();
                return FormateData(products);
            });
        } catch (err) {
            logger.error(`Error in GetProducts: ${err.message}`);
            throw new APIError('Data Not found', err);
        }
    }

    async GetProductDescription(productId){
        
        const product = await this.repository.FindById(productId);
        return FormateData(product)
    }

    async GetProductsByCategory(category){

        const products = await this.repository.FindByCategory(category);
        return FormateData(products)

    }

    async GetSelectedProducts(selectedIds){
        
        const products = await this.repository.FindSelectedProducts(selectedIds);
        return FormateData(products);
    }

    async GetProductPayload(userId,{ productId, qty },event){

         const product = await this.repository.FindById(productId);

        if(product){
             const payload = { 
                event: event,
                data: { userId, product, qty}
            };
 
             return FormateData(payload)
        }else{
            return FormateData({error: 'No product Available'});
        }

    }
 

}

module.exports = ProductService;
