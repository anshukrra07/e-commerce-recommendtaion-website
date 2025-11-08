import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt that teaches Gemini about your e-commerce site
const SYSTEM_PROMPT = `You are a helpful shopping assistant for an e-commerce website.

PRODUCT CATEGORIES:
- Electronics (phones, laptops, gadgets)
- Clothing (shirts, dresses, fashion wear)
- Footwear (shoes, sneakers, boots, sandals)
- Accessories (bags, watches, jewelry)
- Home Decor (furniture, decorations)

YOUR CAPABILITIES:
1. Help customers find products by category, price, quality
2. Answer questions about shipping, returns, payments
3. Provide product recommendations
4. Be friendly, concise, and helpful

IMPORTANT RULES:
- When customers ask about products, extract: category, price range, quality preference
- For product queries, respond with: "SEARCH: category={category} maxPrice={price} sortBy={cheap|expensive|quality}"
- For general questions, answer directly and helpfully
- Keep responses under 100 words
- Be conversational and friendly

POLICIES:
- Free shipping on orders above ₹999
- 7-day return policy, no questions asked
- Multiple payment options: Credit/Debit cards, UPI, Net Banking, Cash on Delivery
- 1 Year manufacturer warranty on electronics

Examples:
User: "Show me cheap footwear"
You: "SEARCH: category=footwear sortBy=cheap"

User: "Best phone under 10000"
You: "SEARCH: category=electronics maxPrice=10000 sortBy=quality keywords=phone"

User: "What's your return policy?"
You: "We offer a 7-day return policy with no questions asked! If you're not satisfied with your purchase, you can return it within 7 days for a full refund."`;

// Parse Gemini's response for product search intent
const parseSearchIntent = (response) => {
  const searchMatch = response.match(/SEARCH:\s*(.+)/);
  if (!searchMatch) return null;
  
  const params = {};
  const paramsStr = searchMatch[1];
  
  // Extract category
  const categoryMatch = paramsStr.match(/category=(\w+(?:-\w+)?)/);
  if (categoryMatch) params.category = categoryMatch[1];
  
  // Extract maxPrice
  const priceMatch = paramsStr.match(/maxPrice=(\d+)/);
  if (priceMatch) params.maxPrice = parseInt(priceMatch[1]);
  
  // Extract sortBy
  const sortMatch = paramsStr.match(/sortBy=(\w+)/);
  if (sortMatch) params.sortBy = sortMatch[1];
  
  // Extract keywords
  const keywordsMatch = paramsStr.match(/keywords=([^\s]+)/);
  if (keywordsMatch) params.keywords = keywordsMatch[1];
  
  return params;
};

// Search products based on intent
const searchProducts = async (intent) => {
  try {
    let query = { status: 'approved' };
    let sortOption = {};
    
    // Category filter
    if (intent.category) {
      query.category = intent.category;
    }
    
    // Price filter
    if (intent.maxPrice) {
      query.price = { $lte: intent.maxPrice };
    }
    
    // Keywords filter (search in name and description)
    if (intent.keywords) {
      const keywordRegex = new RegExp(intent.keywords, 'i');
      query.$or = [
        { name: keywordRegex },
        { description: keywordRegex }
      ];
    }
    
    // Sorting
    if (intent.sortBy === 'cheap') {
      sortOption = { price: 1 };
    } else if (intent.sortBy === 'expensive') {
      sortOption = { price: -1 };
    } else if (intent.sortBy === 'quality') {
      sortOption = { sold: -1 }; // Popular = quality indicator
    }
    
    const products = await Product.find(query)
      .populate('seller', 'businessName')
      .sort(sortOption)
      .limit(6)
      .select('-__v');
    
    return products;
  } catch (error) {
    console.error('Product search error:', error);
    return [];
  }
};

// @desc    Chat with Gemini AI assistant
// @route   POST /api/chatbot
// @access  Public
export const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }
    
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        response: "🤖 Chatbot is not configured yet. Please add GEMINI_API_KEY to your .env file.\n\nGet your free API key at: https://makersuite.google.com/app/apikey",
        products: []
      });
    }
    
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    // Build conversation context
    let prompt = SYSTEM_PROMPT + '\n\n';
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      conversationHistory.slice(-4).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    
    prompt += `User: ${message}\nAssistant:`;
    
    // Get Gemini response
    const result = await model.generateContent(prompt);
    const response = result.response;
    const geminiReply = response.text();
    
    // Check if Gemini wants to search for products
    const searchIntent = parseSearchIntent(geminiReply);
    let products = [];
    let finalResponse = geminiReply;
    
    if (searchIntent) {
      // Search for products
      products = await searchProducts(searchIntent);
      
      // Remove the SEARCH command from response
      finalResponse = geminiReply.replace(/SEARCH:.*/, '').trim();
      
      // Add product count to response
      if (products.length > 0) {
        if (!finalResponse) {
          finalResponse = `I found ${products.length} products for you! 🎉`;
        }
      } else {
        finalResponse = "I couldn't find any products matching your requirements. Try adjusting your search or browse our categories!";
      }
    }
    
    res.status(200).json({
      success: true,
      response: finalResponse,
      products: products.map(p => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        discount: p.discount,
        category: p.category,
        image: p.image,
        images: p.images,
        seller: p.seller?.businessName,
        sold: p.sold,
        stock: p.stock
      }))
    });
    
  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Friendly error message
    let errorMessage = "Sorry, I encountered an error. Please try again!";
    
    if (error.message?.includes('API key')) {
      errorMessage = "🔑 API key error. Please check your GEMINI_API_KEY in .env file.";
    }
    
    res.status(500).json({
      success: false,
      response: errorMessage,
      products: []
    });
  }
};
