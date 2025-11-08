# Chatbot Setup Guide

## Overview
The e-commerce platform now includes an AI-powered shopping assistant chatbot built with Google's Gemini AI. The chatbot can:
- Help customers find products by category, price, and quality
- Answer questions about shipping, returns, and policies
- Provide personalized product recommendations
- Display products directly in the chat interface

## Features
✅ **Natural Language Understanding** - Ask in plain English  
✅ **Product Search** - "Show me cheap footwear" or "Best phone under 10000"  
✅ **Policy Information** - Shipping, returns, payment options  
✅ **Visual Product Cards** - Products displayed with images and prices  
✅ **Conversation Memory** - Maintains context across messages  

## Setup Instructions

### 1. Get Gemini API Key (Free)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Add API Key to Backend

Edit `backend/.env` and add:

```env
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the actual API key from step 1.

### 3. Restart Backend

```bash
cd backend
npm start
```

The chatbot will now be fully functional!

## Usage

### Customer Side
1. Visit the homepage
2. Click the floating "Need Help?" button (bottom right corner)
3. Type your question or product request
4. The chatbot will respond and show relevant products if applicable

### Example Queries

**Product Search:**
- "Show me cheap footwear"
- "Best phone under 10000"
- "Expensive laptops"
- "Quality electronics"

**Information Queries:**
- "What's your return policy?"
- "How much is shipping?"
- "What payment methods do you accept?"
- "Do you have warranty on electronics?"

## Architecture

### Backend (`backend/controllers/chatbotController.js`)
- **System Prompt**: Trains Gemini about the e-commerce store
- **Intent Parsing**: Extracts search parameters from natural language
- **Product Search**: Queries MongoDB based on extracted intent
- **Response Formatting**: Returns conversation response + product results

### Frontend Components

**`ChatbotButton`** (`frontend1/src/shared/components/ChatbotButton/`)
- Floating action button at bottom-right
- Animated with pulse and wave effects
- Mobile responsive (icon only on mobile)

**`ChatbotModal`** (`frontend1/src/shared/components/ChatbotModal/`)
- Full chat interface with message history
- Product grid display within chat
- Typing indicator for AI responses
- Auto-scroll to latest messages
- Mobile-friendly design

### API Endpoint

**POST** `/api/chatbot`
- **Body**: `{ message: string, conversationHistory: array }`
- **Response**: `{ success: boolean, response: string, products: array }`

## Customization

### Modify Chatbot Personality
Edit `backend/controllers/chatbotController.js` → `SYSTEM_PROMPT` to change:
- Tone and style
- Available categories
- Store policies
- Response length

### Adjust Product Search Logic
Edit the `searchProducts` function in `chatbotController.js` to:
- Add more filters
- Change sorting algorithms
- Limit product count
- Add rating filters

### Customize UI
- `ChatbotButton.css` - Change button position, colors, animations
- `ChatbotModal.css` - Modify chat interface styling
- Update gradient colors to match brand identity

## Troubleshooting

### "Chatbot is not configured" Message
- Add `GEMINI_API_KEY` to `backend/.env`
- Restart the backend server

### No Products Shown
- Ensure products have `status: 'approved'` in MongoDB
- Check search query parameters in backend logs
- Verify product categories match chatbot expectations

### API Rate Limits
- Free tier: 60 requests/minute
- If exceeded, chatbot will show error message
- Consider implementing rate limiting on frontend

## Cost & Limits

**Google Gemini API (Free Tier)**
- 60 requests per minute
- 1,500 requests per day
- Completely free for development
- No credit card required

## Future Enhancements

Potential improvements:
- [ ] Add chatbot to ShopPage and ProductDetailsPage
- [ ] Implement conversation persistence (save to database)
- [ ] Add voice input/output
- [ ] Multi-language support
- [ ] Sentiment analysis for customer feedback
- [ ] Integration with order tracking
- [ ] Proactive product suggestions based on browsing

## Security Notes

- API key is server-side only (never exposed to frontend)
- No authentication required for chatbot (public access)
- Consider adding rate limiting for production
- Implement CORS properly for production deployment

## Testing Checklist

- [x] Backend route registered
- [x] Chatbot button appears on homepage
- [x] Modal opens/closes correctly
- [x] Messages send and receive
- [x] Products display in grid
- [x] Product links work
- [x] Mobile responsive
- [ ] Gemini API key configured
- [ ] Test with various queries
- [ ] Test error handling

## Documentation References

- [Google Gemini AI](https://ai.google.dev/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [React Components](https://react.dev/)
