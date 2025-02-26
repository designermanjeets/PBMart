const { Client } = require('@elastic/elasticsearch');
const { 
    ELASTICSEARCH_NODE, 
    ELASTICSEARCH_USERNAME, 
    ELASTICSEARCH_PASSWORD,
    ELASTICSEARCH_PRODUCT_INDEX,
    ELASTICSEARCH_ANALYTICS_INDEX
} = require('../config');
const { ElasticsearchError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');
const logger = createLogger('elasticsearch-service');

// Singleton instance
let instance = null;

class ElasticsearchService {
    constructor() {
        if (instance) {
            return instance;
        }
        
        this.client = null;
        this.isConnected = false;
        this.productIndex = ELASTICSEARCH_PRODUCT_INDEX;
        this.analyticsIndex = ELASTICSEARCH_ANALYTICS_INDEX;
        
        instance = this;
    }

    async initializeConnection() {
        try {
            const config = {
                node: ELASTICSEARCH_NODE,
                ssl: {
                    rejectUnauthorized: false
                }
            };

            // Add authentication if provided
            if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
                config.auth = {
                    username: ELASTICSEARCH_USERNAME,
                    password: ELASTICSEARCH_PASSWORD
                };
            }

            this.client = new Client(config);
            
            // Test connection
            const info = await this.client.info();
            logger.info(`Connected to Elasticsearch cluster: ${info.cluster_name || 'unknown'}`);
            
            // Initialize indices
            await this.initializeIndices();
            
            this.isConnected = true;
            return true;
        } catch (error) {
            logger.error(`Failed to connect to Elasticsearch: ${error.message}`);
            this.isConnected = false;
            return false;
        }
    }

    // Static method to check connection
    static async checkConnection() {
        try {
            const service = new ElasticsearchService();
            if (service.isConnected && service.client) {
                return true;
            }
            
            const client = new Client({
                node: ELASTICSEARCH_NODE,
                ssl: { rejectUnauthorized: false }
            });
            
            await client.ping();
            return true;
        } catch (err) {
            logger.error(`Elasticsearch connection check failed: ${err.message}`);
            return false;
        }
    }

    async initializeIndices() {
        try {
            // Check if product index exists
            const productIndexExists = await this.client.indices.exists({
                index: this.productIndex
            });
            
            if (!productIndexExists) {
                await this.createProductIndex();
            }
            
            // Check if analytics index exists
            const analyticsIndexExists = await this.client.indices.exists({
                index: this.analyticsIndex
            });
            
            if (!analyticsIndexExists) {
                await this.createAnalyticsIndex();
            }
        } catch (error) {
            logger.error(`Error initializing indices: ${error.message}`);
            throw new ElasticsearchError(`Failed to initialize indices: ${error.message}`);
        }
    }

    async createProductIndex() {
        try {
            await this.client.indices.create({
                index: this.productIndex,
                body: {
                    settings: {
                        analysis: {
                            analyzer: {
                                custom_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'asciifolding', 'stop', 'snowball']
                                }
                            }
                        }
                    },
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            name: { 
                                type: 'text',
                                analyzer: 'custom_analyzer',
                                fields: {
                                    keyword: { type: 'keyword' }
                                }
                            },
                            description: { 
                                type: 'text',
                                analyzer: 'custom_analyzer'
                            },
                            category: { type: 'keyword' },
                            price: { type: 'float' },
                            brand: { type: 'keyword' },
                            inStock: { type: 'boolean' },
                            tags: { type: 'keyword' },
                            attributes: { type: 'object' },
                            createdAt: { type: 'date' },
                            updatedAt: { type: 'date' }
                        }
                    }
                }
            });
            
            logger.info(`Created product index: ${this.productIndex}`);
        } catch (error) {
            logger.error(`Error creating product index: ${error.message}`);
            throw new ElasticsearchError(`Failed to create product index: ${error.message}`);
        }
    }

    async createAnalyticsIndex() {
        try {
            await this.client.indices.create({
                index: this.analyticsIndex,
                body: {
                    mappings: {
                        properties: {
                            userId: { type: 'keyword' },
                            searchQuery: { type: 'text' },
                            filters: { type: 'object' },
                            resultCount: { type: 'integer' },
                            clickedResults: { type: 'keyword' },
                            sessionId: { type: 'keyword' },
                            timestamp: { type: 'date' }
                        }
                    }
                }
            });
            
            logger.info(`Created analytics index: ${this.analyticsIndex}`);
        } catch (error) {
            logger.error(`Error creating analytics index: ${error.message}`);
            throw new ElasticsearchError(`Failed to create analytics index: ${error.message}`);
        }
    }

    // Search products
    async SearchProducts(query, filters = {}, pagination = { page: 1, limit: 10 }, sort = {}, userId = null) {
        try {
            if (!this.client) {
                await this.initializeConnection();
            }
            
            const { page, limit } = pagination;
            const from = (page - 1) * limit;
            
            // Build query
            const searchQuery = {
                bool: {
                    must: []
                }
            };
            
            // Add text search if query provided
            if (query && query.trim()) {
                searchQuery.bool.must.push({
                    multi_match: {
                        query,
                        fields: ['name^3', 'description', 'tags^2', 'brand^2', 'category'],
                        fuzziness: 'AUTO'
                    }
                });
            } else {
                // If no query, match all documents
                searchQuery.bool.must.push({ match_all: {} });
            }
            
            // Add filters
            if (filters) {
                const filterClauses = [];
                
                if (filters.category) {
                    filterClauses.push({ term: { category: filters.category } });
                }
                
                if (filters.brand) {
                    filterClauses.push({ term: { brand: filters.brand } });
                }
                
                if (filters.minPrice !== undefined) {
                    filterClauses.push({ range: { price: { gte: filters.minPrice } } });
                }
                
                if (filters.maxPrice !== undefined) {
                    filterClauses.push({ range: { price: { lte: filters.maxPrice } } });
                }
                
                if (filters.inStock !== undefined) {
                    filterClauses.push({ term: { inStock: filters.inStock } });
                }
                
                if (filterClauses.length > 0) {
                    searchQuery.bool.filter = filterClauses;
                }
            }
            
            // Build sort
            const sortOptions = [];
            
            if (sort && sort.field) {
                const sortOrder = sort.order === 'desc' ? 'desc' : 'asc';
                
                if (sort.field === 'name') {
                    sortOptions.push({ 'name.keyword': { order: sortOrder } });
                } else if (sort.field === 'price') {
                    sortOptions.push({ price: { order: sortOrder } });
                } else if (sort.field === 'createdAt') {
                    sortOptions.push({ createdAt: { order: sortOrder } });
                }
            } else {
                // Default sort by relevance (if query provided) or newest
                if (query && query.trim()) {
                    sortOptions.push({ _score: { order: 'desc' } });
                } else {
                    sortOptions.push({ createdAt: { order: 'desc' } });
                }
            }
            
            // Execute search
            const response = await this.client.search({
                index: this.productIndex,
                body: {
                    query: searchQuery,
                    sort: sortOptions,
                    from,
                    size: limit,
                    // Add aggregations for faceted search
                    aggs: {
                        categories: {
                            terms: { field: 'category', size: 20 }
                        },
                        brands: {
                            terms: { field: 'brand', size: 20 }
                        },
                        price_ranges: {
                            range: {
                                field: 'price',
                                ranges: [
                                    { to: 50 },
                                    { from: 50, to: 100 },
                                    { from: 100, to: 200 },
                                    { from: 200, to: 500 },
                                    { from: 500 }
                                ]
                            }
                        }
                    }
                }
            });
            
            // Format results
            const hits = response.hits.hits.map(hit => ({
                id: hit._source.id,
                name: hit._source.name,
                description: hit._source.description,
                category: hit._source.category,
                price: hit._source.price,
                brand: hit._source.brand,
                inStock: hit._source.inStock,
                tags: hit._source.tags,
                attributes: hit._source.attributes,
                score: hit._score
            }));
            
            // Format aggregations
            const aggregations = {
                categories: response.aggregations.categories.buckets.map(bucket => ({
                    name: bucket.key,
                    count: bucket.doc_count
                })),
                brands: response.aggregations.brands.buckets.map(bucket => ({
                    name: bucket.key,
                    count: bucket.doc_count
                })),
                priceRanges: response.aggregations.price_ranges.buckets.map(bucket => ({
                    range: `${bucket.from || 0} - ${bucket.to || 'above'}`,
                    count: bucket.doc_count
                }))
            };
            
            return {
                hits,
                total: response.hits.total.value,
                page,
                limit,
                totalPages: Math.ceil(response.hits.total.value / limit),
                aggregations
            };
        } catch (error) {
            logger.error(`Error searching products: ${error.message}`);
            throw new ElasticsearchError(`Failed to search products: ${error.message}`);
        }
    }

    // Get search suggestions
    async GetSuggestions(query, limit = 5) {
        try {
            if (!this.client) {
                await this.initializeConnection();
            }
            
            const response = await this.client.search({
                index: this.productIndex,
                body: {
                    query: {
                        multi_match: {
                            query,
                            fields: ['name^3', 'brand^2', 'category'],
                            fuzziness: 'AUTO'
                        }
                    },
                    size: limit
                }
            });
            
            // Extract suggestions from product names
            const suggestions = response.hits.hits.map(hit => hit._source.name);
            
            // Get popular searches that match the query
            const analyticsResponse = await this.client.search({
                index: this.analyticsIndex,
                body: {
                    query: {
                        wildcard: {
                            searchQuery: `${query.toLowerCase()}*`
                        }
                    },
                    aggs: {
                        popular_searches: {
                            terms: {
                                field: 'searchQuery',
                                size: limit
                            }
                        }
                    },
                    size: 0
                }
            });
            
            // Add popular searches to suggestions
            const popularSearches = analyticsResponse.aggregations?.popular_searches?.buckets || [];
            popularSearches.forEach(bucket => {
                if (!suggestions.includes(bucket.key) && suggestions.length < limit) {
                    suggestions.push(bucket.key);
                }
            });
            
            return suggestions;
        } catch (error) {
            logger.error(`Error getting suggestions: ${error.message}`);
            throw new ElasticsearchError(`Failed to get suggestions: ${error.message}`);
        }
    }

    // Index a product
    async IndexProduct(product) {
        try {
            if (!this.client) {
                await this.initializeConnection();
            }
            
            const now = new Date();
            
            const document = {
                ...product,
                createdAt: product.createdAt || now,
                updatedAt: now
            };
            
            const response = await this.client.index({
                index: this.productIndex,
                id: product.id,
                body: document,
                refresh: true // Make the document immediately searchable
            });
            
            logger.info(`Indexed product: ${product.id}`);
            
            return {
                id: product.id,
                result: response.result
            };
        } catch (error) {
            logger.error(`Error indexing product: ${error.message}`);
            throw new ElasticsearchError(`Failed to index product: ${error.message}`);
        }
    }

    // Delete a product
    async DeleteProduct(productId) {
        try {
            if (!this.client) {
                await this.initializeConnection();
            }
            
            const response = await this.client.delete({
                index: this.productIndex,
                id: productId,
                refresh: true
            });
            
            logger.info(`Deleted product: ${productId}`);
            
            return {
                id: productId,
                result: response.result
            };
        } catch (error) {
            logger.error(`Error deleting product: ${error.message}`);
            throw new ElasticsearchError(`Failed to delete product: ${error.message}`);
        }
    }

    // Index search analytics
    async IndexSearchAnalytics(analytics) {
        try {
            if (!this.client) {
                await this.initializeConnection();
            }
            
            const response = await this.client.index({
                index: this.analyticsIndex,
                id: analytics.id,
                body: analytics,
                refresh: true
            });
            
            return {
                id: analytics.id,
                result: response.result
            };
        } catch (error) {
            logger.error(`Error indexing search analytics: ${error.message}`);
            throw new ElasticsearchError(`Failed to index search analytics: ${error.message}`);
        }
    }

    // Get search analytics
    async GetSearchAnalytics(startDate, endDate) {
        try {
            if (!this.client) {
                await this.initializeConnection();
            }
            
            const query = {
                bool: {
                    must: [{ match_all: {} }]
                }
            };
            
            if (startDate || endDate) {
                query.bool.filter = {
                    range: {
                        timestamp: {}
                    }
                };
                
                if (startDate) {
                    query.bool.filter.range.timestamp.gte = startDate;
                }
                
                if (endDate) {
                    query.bool.filter.range.timestamp.lte = endDate;
                }
            }
            
            const response = await this.client.search({
                index: this.analyticsIndex,
                body: {
                    query,
                    aggs: {
                        search_over_time: {
                            date_histogram: {
                                field: 'timestamp',
                                calendar_interval: 'day'
                            }
                        },
                        top_searches: {
                            terms: {
                                field: 'searchQuery',
                                size: 10
                            }
                        },
                        zero_results: {
                            filter: {
                                term: {
                                    resultCount: 0
                                }
                            }
                        }
                    },
                    size: 0
                }
            });
            
            return {
                aggregations: {
                    searchOverTime: response.aggregations.search_over_time.buckets.map(bucket => ({
                        date: bucket.key_as_string,
                        count: bucket.doc_count
                    })),
                    topSearches: response.aggregations.top_searches.buckets.map(bucket => ({
                        query: bucket.key,
                        count: bucket.doc_count
                    })),
                    zeroResultsCount: response.aggregations.zero_results.doc_count
                }
            };
        } catch (error) {
            logger.error(`Error getting search analytics: ${error.message}`);
            throw new ElasticsearchError(`Failed to get search analytics: ${error.message}`);
        }
    }
}

module.exports = ElasticsearchService;
// Also export the checkConnection method directly for convenience
module.exports.checkConnection = ElasticsearchService.checkConnection; 