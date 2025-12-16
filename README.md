# 🛒 Smart E-Commerce Platform with AI Product Recommendation System

![alt text](<Screenshot 2025-12-16 at 8.33.23 PM.png>)

WEBSITE LINK-https://e-commerce-recommendtaion-website.vercel.app

A full-stack, production-ready e-commerce platform built using the MERN stack, enhanced with an AI-powered product recommendation system, seller review engine, automatic ML retraining, and an AI shopping assistant chatbot.

---

## 🚀 Key Features

### 👥 Multi-Role Authentication
- Customer: signup, login, personalized recommendations, seller reviews
- Seller: signup with admin approval, product management, image uploads
- Admin: approve sellers/products, monitor platform activity

---

## 🤖 AI & Machine Learning

### Product Recommendation System
- Flask-based ML microservice
- TF-IDF + Cosine Similarity
- Personalized, similar, and popular product recommendations

### Automatic Model Retraining
- Retrains on product create/update/approve/delete
- Event-driven, non-blocking architecture

---

## 💬 AI Shopping Assistant
- Google Gemini-powered chatbot
- Natural language product discovery
- Policy assistance and product cards in chat

---

## ⭐ Seller Reviews
- Customer ratings (1–5 stars)
- Written reviews with edit/delete
- Average rating calculation and filtering

---

## 📸 Image Management
- Cloudinary integration
- CDN delivery and optimization
- Multiple images per product

---

## 🛠 Engineering Practices
- Modular React architecture
- Custom hooks and utilities
- MVC backend design
- Clean, scalable folder structure

---

## 🧱 Tech Stack
Frontend: React.js  
Backend: Node.js, Express.js, MongoDB  
AI/ML: Flask, TF-IDF, Cosine Similarity  
Cloud: Cloudinary, Google Gemini  

---

## 📁 Project Structure
```
e-commerce-platform/
├── backend/
├── frontend1/
├── ml-service/
└── README.md
```

---

## ⚙️ Setup

### Backend
```bash
cd backend
npm install
npm start
```

### ML Service
```bash
cd ml-service
python3 app.py
```

### Frontend
```bash
cd frontend1
npm install
npm start
```

---

## 🏆 Achievement
Built as a Smart E-Commerce Product Recommendation System  
Winner – StackHack Hackathon (College Level)

---

## 📜 License
MIT License
