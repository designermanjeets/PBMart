// Update the exchange type from 'direct' to 'topic'
await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true }); 