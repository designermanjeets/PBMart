const { ShoppingRepository } = require("../database");
const { FormateData } = require("../utils");
const CircuitBreaker = require('../utils/circuit-breaker');
const logger = require('../utils/logger');

// All Business logic will be here
class ShoppingService {

    constructor(){
        this.repository = new ShoppingRepository();
        this.circuitBreaker = new CircuitBreaker();
    }

    async GetCart({ _id }){
        
        const cartItems = await this.repository.Cart(_id);
        return FormateData(cartItems);
    }


    async PlaceOrder(userInput){
        try {
            return await this.circuitBreaker.execute(async () => {
                const { _id, txnNumber } = userInput;
                
                const orderResult = await this.repository.CreateNewOrder(_id, txnNumber);
                
                logger.info(`New order created: ${orderResult._id}`);
                return FormateData(orderResult);
            });
        } catch (err) {
            logger.error(`Error in PlaceOrder: ${err.message}`);
            throw new APIError('Data Not found', err);
        }
    }

    async GetOrders(customerId){
        try {
            return await this.circuitBreaker.execute(async () => {
                const orders = await this.repository.Orders(customerId);
                return FormateData(orders);
            });
        } catch (err) {
            logger.error(`Error in GetOrders: ${err.message}`);
            throw new APIError('Data Not found', err);
        }
    }

    async GetOrderDetails({ _id,orderId }){
        const orders = await this.repository.Orders(productId);
        return FormateData(orders)
    }

    async ManageCart(customerId, item,qty, isRemove){

        const cartResult = await this.repository.AddCartItem(customerId,item,qty, isRemove);
        return FormateData(cartResult);
    }
     

    async SubscribeEvents(payload){
 
        payload = JSON.parse(payload);
        const { event, data } = payload;
        const { userId, product, qty } = data;
        
        switch(event){
            case 'ADD_TO_CART':
                this.ManageCart(userId,product, qty, false);
                break;
            case 'REMOVE_FROM_CART':
                this.ManageCart(userId,product, qty, true);
                break;
            default:
                break;
        }
 
    }


    async GetOrderPayload(userId,order,event){

       if(order){
            const payload = { 
               event: event,
               data: { userId, order }
           };

            return payload
       }else{
           return FormateData({error: 'No Order Available'});
       }

   }

 

}

module.exports = ShoppingService;
