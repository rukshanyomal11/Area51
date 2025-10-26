const OpenAI = require('openai');
const Product = require('../models/Product');

class AIService {
  constructor() {
    try {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize OpenAI service:', error);
      this.isInitialized = false;
    }
  }

  // Search products based on user query
  async searchProducts(query, filters = {}) {
    try {
      let searchCriteria = {};
      
      // Build MongoDB query based on filters
      if (filters.category) {
        searchCriteria.category = new RegExp(filters.category, 'i');
      }
      
      if (filters.priceRange) {
        searchCriteria.price = {};
        if (filters.priceRange.min) searchCriteria.price.$gte = filters.priceRange.min;
        if (filters.priceRange.max) searchCriteria.price.$lte = filters.priceRange.max;
      }
      
      if (filters.size) {
        searchCriteria.size = new RegExp(filters.size, 'i');
      }
      
      if (filters.color) {
        searchCriteria.color = new RegExp(filters.color, 'i');
      }
      
      if (filters.brand) {
        searchCriteria.brand = new RegExp(filters.brand, 'i');
      }
      
      if (filters.style) {
        searchCriteria.style = new RegExp(filters.style, 'i');
      }

      // Text search across multiple fields
      if (query) {
        const searchRegex = new RegExp(query.split(' ').join('|'), 'i');
        searchCriteria.$or = [
          { title: searchRegex },
          { brand: searchRegex },
          { style: searchRegex },
          { material: searchRegex },
          { category: searchRegex }
        ];
      }

      const products = await Product.find(searchCriteria).limit(20);
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Extract search intent and filters from user message
  async extractSearchIntent(userMessage) {
    if (!this.isInitialized) {
      // Fallback to basic keyword extraction
      return {
        intent: "search",
        category: null,
        productType: null,
        priceRange: {},
        keywords: userMessage.toLowerCase().split(' ').filter(word => word.length > 2)
      };
    }

    try {
      const prompt = `
        Analyze this user message and extract product search information. Return a JSON object with the following structure:
        {
          "intent": "search|browse|compare|recommend",
          "category": "Men|Women|null",
          "productType": "extracted product type or null",
          "priceRange": {"min": number or null, "max": number or null},
          "size": "extracted size or null",
          "color": "extracted color or null", 
          "brand": "extracted brand or null",
          "style": "extracted style or null",
          "keywords": ["relevant", "search", "terms"]
        }

        User message: "${userMessage}"

        Examples:
        - "Show me black men's shirts under $50" → {"intent": "search", "category": "Men", "productType": "shirts", "priceRange": {"max": 50}, "color": "black", "keywords": ["black", "shirts"]}
        - "I need a dress for a party" → {"intent": "search", "category": "Women", "productType": "dress", "style": "party", "keywords": ["dress", "party"]}
        - "What's available in size M?" → {"intent": "browse", "size": "M", "keywords": ["size", "M"]}
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 300
      });

      const content = response.choices[0].message.content.trim();
      return JSON.parse(content);
    } catch (error) {
      console.error('Error extracting search intent:', error);
      // Fallback to basic keyword extraction
      return {
        intent: "search",
        category: null,
        productType: null,
        priceRange: {},
        keywords: userMessage.toLowerCase().split(' ').filter(word => word.length > 2)
      };
    }
  }

  // Generate AI response with product recommendations
  async generateResponse(userMessage, searchResults, conversationHistory = []) {
    if (!this.isInitialized) {
      // Fallback response when OpenAI is not available
      let response = "I'm here to help you find products! ";
      
      if (searchResults && searchResults.length > 0) {
        response += `I found ${searchResults.length} products that might interest you:\n\n`;
        searchResults.slice(0, 3).forEach((product, index) => {
          response += `${index + 1}. ${product.title} - $${product.price} (${product.brand})\n`;
        });
      } else {
        response += "Could you please tell me what type of product you're looking for? For example, shirts, dresses, or shoes?";
      }
      
      return response;
    }

    try {
      let productsContext = '';
      if (searchResults && searchResults.length > 0) {
        productsContext = `\n\nAvailable products matching your search:\n`;
        searchResults.slice(0, 5).forEach((product, index) => {
          productsContext += `${index + 1}. ${product.title} - $${product.price} (${product.brand}, ${product.category})\n   Available sizes: ${product.size.join(', ')}\n   Available colors: ${product.color.join(', ')}\n   Style: ${product.style}\n\n`;
        });
      }

      const conversationContext = conversationHistory
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = `
        You are a helpful AI shopping assistant for an online clothing store. Your role is to help customers find products that match their needs and preferences.

        Store Information:
        - We sell men's and women's clothing
        - Categories include shirts, pants, dresses, jackets, and more
        - We carry various brands, sizes, colors, and styles
        - Price ranges vary by product type

        Guidelines:
        - Be friendly, helpful, and enthusiastic
        - Provide specific product recommendations when available
        - Ask clarifying questions if needed (size, color preference, occasion, budget)
        - Mention key product details (price, brand, available sizes/colors)
        - If no products match, suggest alternatives or ask to adjust criteria
        - Keep responses concise but informative
        - Use emojis occasionally to make responses more engaging

        Conversation history:
        ${conversationContext}

        Current user message: "${userMessage}"
        ${productsContext}

        Provide a helpful response:
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 400
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team for assistance.";
    }
  }

  // Get product recommendations based on user preferences
  async getRecommendations(userPreferences = {}) {
    try {
      let searchCriteria = {};
      
      if (userPreferences.category) {
        searchCriteria.category = userPreferences.category;
      }
      
      if (userPreferences.priceRange) {
        searchCriteria.price = {};
        if (userPreferences.priceRange.min) searchCriteria.price.$gte = userPreferences.priceRange.min;
        if (userPreferences.priceRange.max) searchCriteria.price.$lte = userPreferences.priceRange.max;
      }

      // Get random products if no specific criteria
      const products = await Product.aggregate([
        { $match: searchCriteria },
        { $sample: { size: 8 } } // Random sampling
      ]);

      return products;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // Format products for response
  formatProductsForResponse(products) {
    return products.map(product => ({
      productId: product._id,
      title: product.title,
      price: product.price,
      imageSrc: product.imageSrc,
      brand: product.brand,
      category: product.category,
      sizes: product.size,
      colors: product.color,
      style: product.style
    }));
  }
}

module.exports = new AIService();