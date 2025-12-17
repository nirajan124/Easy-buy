import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './VirtualAssistant.css';

const VirtualAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Namaste! 👋 Welcome to Easy Buy. I\'m your virtual assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [messages, isOpen]);

  // Fetch products and categories when assistant opens
  useEffect(() => {
    if (isOpen) {
      fetchProductsData();
    }
  }, [isOpen]);

  const fetchProductsData = async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get('http://localhost:5000/api/products', {
        params: { status: 'available' }
      });
      const allProducts = response.data.data || [];
      setProducts(allProducts);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Knowledge base about the website - Enhanced with project details
  const knowledgeBase = {
    greeting: [
      'Namaste! Welcome to Easy Buy! 🙏',
      'Hello! How can I help you? 👋',
      'Hi there! Welcome to Easy Buy! 😊'
    ],
    about: [
      'Easy Buy is Nepal\'s leading marketplace for buying and selling second-hand items. You can find great deals on electronics, furniture, clothing, and more!',
      'We are a trusted platform where buyers and sellers connect safely. You can buy quality second-hand products at affordable prices or sell items you no longer need.',
      'Easy Buy helps you buy and sell second-hand items in Nepal. We ensure safe transactions and connect you with verified sellers and buyers.'
    ],
    admin: [
      'Admin Dashboard Features:\n• Total Users, Products, Sales, Revenue stats\n• Bar chart for sales revenue (last 6 months)\n• Pie chart for products by category\n• Order management with approve/reject\n• User management\n• Product management\n• Feedback management\n\n**Admin Access:**\nAdmin credentials are restricted. If you need admin access, please contact the system administrator.',
      'Admin can:\n• View all users and products\n• Delete users and products\n• Approve/reject orders\n• View all feedbacks\n• Manage footer content\n• View statistics and charts\n\n**Note:** Admin access requires proper authorization. Contact support for admin account setup.'
    ],
    orderApproval: [
      'Order Approval Process:\n1. Buyer adds products to cart\n2. Buyer places order (status: Pending)\n3. Buyer can edit order (shipping address, payment method)\n4. Admin reviews and approves/rejects order\n5. After approval, order status changes\n6. Buyer sees success message\n7. Order cannot be edited after approval',
      'Order Status Flow:\n• Pending - Initial state, can be edited\n• Approved - Admin approved, cannot edit\n• Rejected - Admin rejected\n• Processing - Order being processed\n• Completed - Order delivered'
    ],
    features: [
      '🛍️ Browse Products - Search and filter through thousands of second-hand items\n📦 Categories - Electronics, Furniture, Clothing, Books, Shoes, and more\n💰 Best Prices - Find great deals on quality used items\n🛒 Shopping Cart - Add multiple items before checkout\n❤️ Wishlist - Save your favorite products\n📊 Statistics - Track your purchases and sales\n📜 Order History - View all your past orders\n💬 Feedback - Share your experience with us\n🏠 Home Panels - Dedicated home pages for buyers and sellers\n📸 360° Viewer - View products from all angles\n🎨 Modern UI - Beautiful design with Inter font and 2-color scheme',
      'Key features include:\n• Product browsing with search and filters\n• Category dropdown (Electronics, Clothes, Perfume, Other)\n• Price filters (Under 1000, 1000-5000, etc.)\n• Sort by latest/price\n• Secure order placement\n• Cart and wishlist management\n• Order tracking and history\n• Seller dashboard for managing products\n• Buyer dashboard for tracking purchases\n• Feedback system\n• Admin dashboard with charts\n• Order approval system\n• Multiple image upload (up to 5 images)\n• Payment methods: COD, Visa, MasterCard'
    ],
    features: [
      '🛍️ Browse Products - Search and filter through thousands of second-hand items\n📦 Categories - Electronics, Furniture, Clothing, Books, and more\n💰 Best Prices - Find great deals on quality used items\n🛒 Shopping Cart - Add multiple items before checkout\n❤️ Wishlist - Save your favorite products\n📊 Statistics - Track your purchases and sales\n📜 Order History - View all your past orders\n💬 Feedback - Share your experience with us',
      'Key features include:\n• Product browsing with search and filters\n• Secure order placement\n• Cart and wishlist management\n• Order tracking and history\n• Seller dashboard for managing products\n• Buyer dashboard for tracking purchases\n• Feedback system'
    ],
    howToBuy: [
      'To buy products:\n1. Register/Login as Buyer\n2. Browse products on Dashboard or Shop page\n3. Use search, category, and price filters\n4. Click on a product to view details (360° viewer)\n5. Add to Cart or Wishlist (❤️ heart button)\n6. Go to Cart and checkout\n7. Select payment method (COD, Visa, or MasterCard)\n8. Enter shipping address\n9. Place your order (status: Pending)\n10. Edit order if needed (before admin approval)\n11. Wait for admin approval\n12. Track order status in Order History',
      'Buying Steps:\n• Register as Buyer\n• Browse and search products\n• Filter by category, price, latest\n• View product with 360° images\n• Add to cart or wishlist\n• Checkout with payment\n• Order shows as "Pending"\n• Can edit before approval\n• Admin approves order\n• Track in Order History\n• Receive items!'
    ],
    howToSell: [
      'To sell products:\n1. Register as a Seller\n2. Go to your Seller Dashboard\n3. Click "Add Product"\n4. Fill in product details:\n   - Title, Description, Price\n   - Category (Electronics, Clothes, Perfume, Other)\n   - Condition (New, Like New, Good, Fair)\n5. Upload up to 5 images (all formats supported)\n6. Images are automatically compressed\n7. Submit your product\n8. View your products in "My Products"\n9. Edit or delete products\n10. Wait for buyers to order\n11. View orders in Order History\n12. Track sales statistics',
      'Selling Process:\n• Register as Seller\n• Go to Seller Dashboard\n• Click "Add Product"\n• Fill details (title, price, category, condition)\n• Upload 4-5 images (auto-compressed)\n• Submit product\n• Manage products (edit/delete)\n• View orders from buyers\n• Track sales in statistics\n• Complete transactions'
    ],
    payment: [
      'We support multiple payment methods:\n💵 Cash on Delivery (COD) - Pay when you receive the item\n💳 Visa Card - Secure online payment\n💳 MasterCard - Secure online payment\n\nFor card payments, you need to enter:\n• Card Number\n• Cardholder Name\n• Expiry Date (MM/YY)\n• CVV\n\nMost buyers prefer COD for easy transactions. Card payments are processed securely.',
      'Payment Methods:\n• Cash on Delivery (COD) - Most popular, pay on delivery\n• Visa Card - Enter card details during checkout\n• MasterCard - Enter card details during checkout\n\nYou can change payment method before admin approval if order is pending.'
    ],
    registration: [
      'To register:\n1. Go to Login page\n2. Click "Register here" or toggle to Register\n3. Choose your role:\n   - Buyer: To buy products\n   - Seller: To sell products\n4. Fill in your details:\n   - Name (required)\n   - Email (required)\n   - Password (required)\n   - Confirm Password (required)\n   - Phone (optional)\n   - Address (optional)\n5. Submit registration\n6. Automatically redirected to your dashboard\n7. Start using Easy Buy!',
      'Registration Steps:\n• Go to Login page\n• Click "Register here"\n• Select role: Buyer or Seller\n• Fill required fields (name, email, password)\n• Add optional phone and address\n• Submit\n• Auto-redirect to dashboard\n• Start shopping or selling!'
    ],
    categories: [
      'We have various categories:\n📱 Electronics - Phones, Laptops, Tablets\n🪑 Furniture - Chairs, Tables, Sofas\n👕 Clothing - Apparel, Shoes, Accessories\n📚 Books - Textbooks, Novels, Magazines\n🏠 Home & Kitchen - Appliances, Decor\n🚗 Vehicles - Bikes, Cars (if available)\n🎮 Gaming - Consoles, Games\n💍 Jewelry - Accessories\n\nYou can browse by category using filters!',
      'Available categories include Electronics, Furniture, Clothing, Books, Home & Kitchen items, and more. Use the category filters to find exactly what you need!'
    ],
    safety: [
      'Your safety is our priority:\n✅ Verified sellers and buyers\n✅ Secure payment methods\n✅ Order tracking system\n✅ Feedback and rating system\n✅ Admin monitoring\n✅ Safe transaction process\n\nAlways check seller ratings before buying!',
      'We ensure safety through:\n• User verification\n• Secure payments\n• Order tracking\n• Rating system\n• Admin support\n\nShop with confidence!'
    ],
    contact: [
      'Contact us through:\n📧 Email: support@easybuy.com\n📞 Phone: +977-1234567890\n📍 Address: Kathmandu, Nepal\n💬 Feedback Page - Share your thoughts\n📝 Contact Us Page - Full contact form\n\nYou can:\n• Visit /contact page for contact form\n• Visit /feedback page to submit feedback\n• Admin can edit contact info in footer',
      'Contact Options:\n• Email: support@easybuy.com\n• Phone: +977-1234567890\n• Address: Kathmandu, Nepal\n• Visit /contact page for contact form\n• Visit /feedback page for feedback\n• Footer has contact information\n• Admin can manage contact details'
    ],
    price: [
      'Prices vary by product and seller:\n💰 Browse products to see current prices\n📊 Use price filters (Under Rs. 1000, 1000-5000, etc.)\n💵 Negotiate with sellers (if they allow)\n🎯 Compare prices across different sellers\n\nAll prices are in Nepalese Rupees (Rs.)',
      'Pricing:\n• Check product pages for prices\n• Use price range filters\n• Prices shown in Nepalese Rupees\n• Compare different sellers'
    ],
    shipping: [
      'Shipping information:\n🚚 Seller provides shipping address details\n📍 You provide delivery address during checkout\n⏱️ Delivery time depends on seller location\n📦 Track your order status in Order History\n\nMost transactions are local (within Nepal).',
      'Shipping:\n• Provide your address during checkout\n• Seller will contact you for delivery\n• Check order status for updates\n• Delivery within Nepal'
    ],
    dashboard: [
      'Dashboard Features:\n\n**Buyer Dashboard:**\n• Browse all products\n• Search and filter (category, price, latest)\n• View product details with 360° viewer\n• Add to cart and wishlist\n• View orders (pending/approved)\n• Edit pending orders\n• Statistics (orders, spending, cart, wishlist)\n• Charts for purchase analysis\n• Home panel with quick stats\n\n**Seller Dashboard:**\n• Add products (up to 5 images)\n• Manage your products (edit/delete)\n• View orders from buyers\n• Sales statistics and charts\n• Revenue tracking\n• Home panel with business stats\n\n**Admin Dashboard:**\n• View all users and products\n• Delete users/products\n• Approve/reject orders\n• View all feedbacks\n• Statistics and charts\n• Manage footer content',
      'Dashboards:\n• Buyer: Browse, search, filter, cart, wishlist, orders, stats\n• Seller: Add products, manage products, view orders, sales stats\n• Admin: Manage users/products, approve orders, view feedbacks, stats'
    ],
    images: [
      'Image Features:\n• Upload up to 5 images per product\n• Supports all image formats (JPEG, PNG, GIF, WebP, BMP, SVG)\n• Automatic image compression\n• 360° product viewer\n• Drag/swipe to rotate images\n• Thumbnail navigation\n• Images stored as Base64\n• Maximum 10MB per image (auto-compressed)\n• Total payload limit: 35MB',
      'Product Images:\n• Maximum 5 images per product\n• All formats supported\n• Auto-compression for large images\n• 360° viewer for multiple images\n• Interactive rotation\n• Thumbnail gallery'
    ],
    filters: [
      'Filter Options:\n• Category Filter: Electronics, Clothes, Perfume, Other\n• Price Filter: Under Rs. 1000, 1000-5000, 5000-10000, Above 10000\n• Sort By: Latest Post, Price (Low to High), Price (High to Low)\n• Search: Search by product name or category\n• All filters work together\n• Real-time filtering',
      'Available Filters:\n• Category dropdown\n• Price range filters\n• Sort by latest/price\n• Search bar\n• All filters combined'
    ],
    default: [
      'I\'m not sure about that. Here are some things I can help with:\n\n• About Easy Buy\n• Admin login credentials\n• How to buy products\n• How to sell products\n• Payment methods\n• Registration\n• Product categories\n• Order approval process\n• Dashboard features\n• Image upload\n• Filters and search\n• Safety features\n• Contact information\n• Feedback system\n\nTry asking about any of these!',
      'I can help you with:\n• Website features and functionality\n• Admin credentials\n• Buying and selling process\n• Payment options\n• Registration\n• Categories and filters\n• Order approval\n• Dashboard features\n• Image upload\n• Safety\n• Contact details\n• Feedback\n\nWhat would you like to know?'
    ]
  };

  // Check product availability by category or name - Improved
  const checkProductAvailability = (searchTerm) => {
    if (!products || products.length === 0) {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];

    const matchedProducts = products.filter(product => {
      const title = (product.title || '').toLowerCase();
      const category = (product.category || '').toLowerCase().trim();
      const description = (product.description || '').toLowerCase();
      
      // Exact category match (e.g., "Shoes", "Electronics")
      if (category === term || category.includes(term) || term.includes(category)) {
        return true;
      }
      
      // Title or description match
      if (title.includes(term) || description.includes(term)) {
        return true;
      }
      
      // Partial word match in title/description
      const words = term.split(/\s+/);
      for (const word of words) {
        if (word.length > 2 && (title.includes(word) || description.includes(word))) {
          return true;
        }
      }
      
      return false;
    });

    return matchedProducts;
  };

  // Get category mapping for common product names - matches actual categories
  const getCategoryFromProduct = (productName) => {
    const name = productName.toLowerCase();
    const categoryMap = {
      // Shoes mapping
      'shoe': ['Shoes', 'Clothes'],
      'shoes': ['Shoes', 'Clothes'],
      'jutta': ['Shoes', 'Clothes'],
      'boot': ['Shoes', 'Clothes'],
      'sneaker': ['Shoes', 'Clothes'],
      // Electronics mapping
      'phone': ['Electronics'],
      'mobile': ['Electronics'],
      'laptop': ['Electronics'],
      'computer': ['Electronics'],
      'tablet': ['Electronics'],
      // Furniture mapping
      'chair': ['Furniture'],
      'table': ['Furniture'],
      'sofa': ['Furniture'],
      'furniture': ['Furniture'],
      // Books mapping
      'book': ['Books'],
      'books': ['Books'],
      // Clothing mapping
      'cloth': ['Clothes'],
      'clothes': ['Clothes'],
      'dress': ['Clothes'],
      'shirt': ['Clothes'],
      'clothing': ['Clothes']
    };

    for (const [key, categories] of Object.entries(categoryMap)) {
      if (name.includes(key)) {
        return categories; // Return array of possible categories
      }
    }
    return null;
  };

  // Get emoji for category
  const getCategoryEmoji = (category) => {
    const categoryLower = category.toLowerCase();
    const emojiMap = {
      'electronics': '📱',
      'furniture': '🪑',
      'clothing': '👕',
      'books': '📚',
      'home': '🏠',
      'kitchen': '🍳',
      'vehicles': '🚗',
      'gaming': '🎮',
      'jewelry': '💍',
      'sports': '⚽',
      'toys': '🧸'
    };

    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (categoryLower.includes(key)) {
        return emoji;
      }
    }
    return '📦';
  };

  // Intelligent response matching
  const getResponse = (userMessage) => {
    const message = userMessage.toLowerCase().trim();
    
    // Login Questions - Comprehensive matching (Secure - no admin credentials)
    if (message.match(/\b(how to login|how do i login|login|sign in|log in|login process|login steps|login kasto|login kasari|login garne|kaile login|login page|login screen)\b/i) ||
        message.match(/^(login|signin|sign in|log in)$/i)) {
      let response = '**How to Login:** 🔐\n\n1. Go to the Login page\n2. Enter your registered email address\n3. Enter your password\n4. Select your role:\n   • **Buyer** - To buy products\n   • **Seller** - To sell products\n   • **Admin** - To manage the platform (admin access only)\n5. Click "Login" button\n6. You will be redirected to your dashboard automatically\n\n**Don\'t have an account?**\nClick "Register here" on the login page to create a new account!\n\n**Forgot Password?**\nContact support at support@easybuy.com for password recovery.';
      
      // Only show admin credentials if user is already logged in as admin
      if (user && user.role === 'admin') {
        response += '\n\n**Admin Credentials (You are already logged in as admin):**\n📧 Email: nirajanbhattarai20@gmail.com\n🔑 Password: 1234';
      }
      
      return response;
    }
    
    // Login credentials - Secure (only for admin users)
    if (message.match(/\b(login credentials|login details|username|password|email|admin email|admin password|credentials|login info)\b/i)) {
      if (user && user.role === 'admin') {
        return '**Login Credentials:**\n\n**For Admin (You are logged in as admin):**\n📧 Email: nirajanbhattarai20@gmail.com\n🔑 Password: 1234\nRole: Admin\n\n**For Regular Users:**\n• Use the email and password you registered with\n• Select your role (Buyer or Seller) during login\n• If you forgot password, contact support at support@easybuy.com\n\n**Registration Required:**\nIf you don\'t have an account, click "Register here" on the login page to create one!';
      } else {
        return '**Login Credentials:**\n\n**For Users:**\n• Use the email and password you registered with\n• Select your role (Buyer or Seller) during login\n• If you forgot password, contact support at support@easybuy.com\n\n**For Admin Access:**\nAdmin credentials are restricted. Please contact the system administrator.\n\n**Registration Required:**\nIf you don\'t have an account, click "Register here" on the login page to create one!';
      }
    }
    
    // Website Name - Improved matching for Nepali/English
    if (message.match(/\b(website.*naam|website.*name|site.*naam|site.*name|ko naam|ka naam|what.*name|name.*k ho|naam.*k ho)\b/i) ||
        message.match(/^(naam|name|what is the name|website ka naam|website ko naam|easy buy ko naam|site ko naam)$/i)) {
      return 'Our website name is **Easy Buy** 🛒\n\nEasy Buy is Nepal\'s leading marketplace for buying and selling second-hand items. You can find great deals on electronics, furniture, clothing, books, and much more!\n\nVisit our Dashboard or Shop page to start browsing products!';
    }
    
    // Product Availability Questions - Enhanced matching for Nepali/English
    if (message.match(/\b(available|available xa|available cha|pauxa|paucha|k xa|k cha|what.*available|ka.*available|ko.*available|xa|cha|pauxa|paucha)\b/i)) {
      let searchTerm = '';
      let foundProduct = [];
      
      // Common product keywords in Nepali and English - mapped to actual categories
      const productKeywords = {
        'shoe': { keywords: ['shoe', 'shoes', 'jutta', 'boot', 'boots', 'sneaker'], categories: ['Shoes', 'Clothes'] },
        'phone': { keywords: ['phone', 'phones', 'mobile', 'mobiles', 'handset'], categories: ['Electronics'] },
        'laptop': { keywords: ['laptop', 'laptops', 'computer', 'computers', 'pc'], categories: ['Electronics'] },
        'furniture': { keywords: ['chair', 'chairs', 'table', 'tables', 'sofa', 'sofas', 'furniture'], categories: ['Furniture'] },
        'book': { keywords: ['book', 'books', 'kitab'], categories: ['Books'] },
        'clothing': { keywords: ['cloth', 'clothes', 'dress', 'shirt', 'clothing'], categories: ['Clothes'] },
        'electronics': { keywords: ['electronics', 'electronic', 'tv', 'television', 'fridge'], categories: ['Electronics'] }
      };

      // Extract product name from message
      const messageLower = message.toLowerCase();
      
      // Check for product keywords first
      for (const [key, data] of Object.entries(productKeywords)) {
        const { keywords, categories } = data;
        for (const keyword of keywords) {
          if (messageLower.includes(keyword)) {
            searchTerm = keyword;
            
            // First try direct product search
            foundProduct = checkProductAvailability(keyword);
            
            // If no direct match, try category-based search
            if (foundProduct.length === 0 && categories) {
              for (const category of categories) {
                const categoryProducts = products.filter(p => {
                  const productCategory = (p.category || '').trim();
                  return productCategory.toLowerCase() === category.toLowerCase();
                });
                if (categoryProducts.length > 0) {
                  foundProduct = categoryProducts;
                  searchTerm = keyword; // Keep original search term
                  break;
                }
              }
            }
            
            if (foundProduct.length > 0) break;
          }
        }
        if (foundProduct.length > 0) break;
      }

      // If still no match, try general category-based search
      if (foundProduct.length === 0) {
        const possibleCategories = getCategoryFromProduct(message);
        if (possibleCategories && Array.isArray(possibleCategories)) {
          for (const category of possibleCategories) {
            const categoryProducts = products.filter(p => {
              const productCategory = (p.category || '').trim();
              return productCategory.toLowerCase() === category.toLowerCase();
            });
            if (categoryProducts.length > 0) {
              foundProduct = categoryProducts;
              // Extract the product word from message
              const productMatch = messageLower.match(/\b(shoes?|shoe|jutta|phone|mobile|laptop|book|chair|table)\b/);
              searchTerm = productMatch ? productMatch[0] : category.toLowerCase();
              break;
            }
          }
        }
      }

      // Generate accurate response
      if (foundProduct.length > 0) {
        const count = foundProduct.length;
        const category = foundProduct[0].category || 'products';
        const sampleProducts = foundProduct.slice(0, 3).map(p => {
          const title = p.title || 'Product';
          const price = (p.price || 0).toLocaleString();
          return `• ${title} - Rs. ${price}`;
        }).join('\n');
        
        // Format product name properly
        let displayName = searchTerm;
        if (searchTerm === 'shoe' || searchTerm === 'shoes' || searchTerm === 'jutta') {
          displayName = 'shoes';
        } else if (searchTerm === 'book' || searchTerm === 'books') {
          displayName = 'books';
        }
        
        return `Yes! ✅ We have ${count} ${displayName} product${count > 1 ? 's' : ''} available${category !== 'products' ? ` in ${category} category` : ''}:\n\n${sampleProducts}${count > 3 ? `\n\n... and ${count - 3} more!` : ''}\n\nBrowse all products on the Dashboard or Shop page to see more details and prices!`;
      } else {
        // Check if they're asking about general availability
        if (message.match(/\b(available products|sabai|all|k k)\b/i)) {
          if (products.length > 0) {
            return `Yes! We have ${products.length} products available. Browse the Dashboard or Shop page to see all available products with details!`;
          }
        }
        return 'You can browse all available products on the Dashboard or Shop page. We have products in Electronics, Furniture, Clothing, Books, and more categories. Use search and filters to find specific items!';
      }
    }
    
    // Available Products List
    if (message.match(/\b(available products|available items|sabai products|all products|products list|items list|k k xa|k k cha|what products)\b/i)) {
      if (products && products.length > 0) {
        const categoryCounts = {};
        products.forEach(p => {
          const cat = p.category || 'Other';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        const categoryList = Object.entries(categoryCounts)
          .map(([cat, count]) => `• ${cat}: ${count} product${count > 1 ? 's' : ''}`)
          .join('\n');

        return `We have **${products.length} products** available right now! 📦\n\nHere are the categories:\n\n${categoryList}\n\nBrowse the Dashboard or Shop page to see all products with details and prices!`;
      } else {
        return 'Please check the Dashboard or Shop page to see all available products. We have products in Electronics, Furniture, Clothing, Books, and more categories!';
      }
    }
    
    // Greetings - Enhanced
    if (message.match(/\b(hi|hello|namaste|hey|namaskar|good morning|good afternoon|good evening|hi there|hey there|sup|what's up)\b/i)) {
      const greeting = knowledgeBase.greeting[Math.floor(Math.random() * knowledgeBase.greeting.length)];
      return `${greeting}\n\nI can help you with:\n• Login and Registration\n• Buying and Selling\n• Payment Methods\n• Order Process\n• Dashboard Features\n• Admin Access\n• And much more!\n\nWhat would you like to know?`;
    }
    
    // About website
    if (message.match(/\b(what is|about|tell me about|explain|who are you|what is easy buy|what does easy buy do|website|platform)\b/)) {
      return knowledgeBase.about[Math.floor(Math.random() * knowledgeBase.about.length)];
    }
    
    // Features
    if (message.match(/\b(features|what can i do|what do you offer|services|what features|functionality|capabilities)\b/)) {
      return knowledgeBase.features[Math.floor(Math.random() * knowledgeBase.features.length)];
    }
    
    // How to buy
    if (message.match(/\b(how to buy|how do i buy|buying process|purchase|shop|order|how can i buy|steps to buy|buy products)\b/)) {
      return knowledgeBase.howToBuy[Math.floor(Math.random() * knowledgeBase.howToBuy.length)];
    }
    
    // How to sell
    if (message.match(/\b(how to sell|how do i sell|selling process|sell items|add product|post|list|how can i sell|steps to sell|sell products)\b/)) {
      return knowledgeBase.howToSell[Math.floor(Math.random() * knowledgeBase.howToSell.length)];
    }
    
    // Payment
    if (message.match(/\b(payment|pay|cod|cash on delivery|card|visa|mastercard|how to pay|payment method|payment options)\b/)) {
      return knowledgeBase.payment[Math.floor(Math.random() * knowledgeBase.payment.length)];
    }
    
    // Registration - Enhanced
    if (message.match(/\b(register|sign up|create account|join|become|registration|how to register|signup|account|new account|create|signup kasari|register garne|account banaune)\b/i)) {
      return knowledgeBase.registration[Math.floor(Math.random() * knowledgeBase.registration.length)] + '\n\n**After Registration:**\n• You will be automatically redirected to your dashboard\n• No need to login again\n• Start using Easy Buy immediately!';
    }
    
    // Categories - with real data
    if (message.match(/\b(categories|category|types|kinds|sorts|what do you sell)\b/)) {
      if (categories && categories.length > 0) {
        const categoryList = categories.map((cat, index) => {
          const count = products.filter(p => p.category === cat).length;
          const emoji = getCategoryEmoji(cat);
          return `${emoji} ${cat} (${count} products)`;
        }).join('\n');
        
        return `We have the following categories with products:\n\n${categoryList}\n\nBrowse by category using filters on the Dashboard or Shop page!`;
      }
      return knowledgeBase.categories[Math.floor(Math.random() * knowledgeBase.categories.length)];
    }
    
    // Safety
    if (message.match(/\b(safe|safety|secure|security|trust|trusted|reliable|safe to buy|is it safe|protected)\b/)) {
      return knowledgeBase.safety[Math.floor(Math.random() * knowledgeBase.safety.length)];
    }
    
    // Contact
    if (message.match(/\b(contact|email|phone|address|reach|get in touch|support|help|customer service|contact us)\b/)) {
      return knowledgeBase.contact[Math.floor(Math.random() * knowledgeBase.contact.length)];
    }
    
    // Price
    if (message.match(/\b(price|cost|how much|pricing|expensive|cheap|affordable|rates|costs)\b/)) {
      return knowledgeBase.price[Math.floor(Math.random() * knowledgeBase.price.length)];
    }
    
    // Shipping
    if (message.match(/\b(shipping|delivery|deliver|ship|where|location|address|when|time|arrive)\b/)) {
      return knowledgeBase.shipping[Math.floor(Math.random() * knowledgeBase.shipping.length)];
    }
    
    // Admin credentials and features - Secure (only show credentials to admin users)
    if (message.match(/\b(admin|administrator|admin login|admin credentials|admin password|admin email|how to login as admin|admin dashboard|admin features)\b/i)) {
      let response = knowledgeBase.admin[Math.floor(Math.random() * knowledgeBase.admin.length)];
      
      // Only show admin credentials if user is already logged in as admin
      if (user && user.role === 'admin') {
        response += '\n\n**Admin Login Credentials (You are logged in as admin):**\n📧 Email: nirajanbhattarai20@gmail.com\n🔑 Password: 1234';
      } else {
        response += '\n\n**Security Note:** Admin credentials are restricted. If you need admin access, please contact the system administrator at support@easybuy.com.';
      }
      
      return response;
    }
    
    // Order approval
    if (message.match(/\b(order approval|approve order|pending order|edit order|order status|order flow|order process|how orders work)\b/i)) {
      return knowledgeBase.orderApproval[Math.floor(Math.random() * knowledgeBase.orderApproval.length)];
    }
    
    // Dashboard features
    if (message.match(/\b(dashboard|dashboard features|buyer dashboard|seller dashboard|admin dashboard|what can i do|dashboard options)\b/i)) {
      return knowledgeBase.dashboard[Math.floor(Math.random() * knowledgeBase.dashboard.length)];
    }
    
    // Image upload
    if (message.match(/\b(image|images|upload image|how many images|image format|360|viewer|product images|photo|picture)\b/i)) {
      return knowledgeBase.images[Math.floor(Math.random() * knowledgeBase.images.length)];
    }
    
    // Filters
    if (message.match(/\b(filter|filters|category filter|price filter|sort|how to filter|search filter)\b/i)) {
      return knowledgeBase.filters[Math.floor(Math.random() * knowledgeBase.filters.length)];
    }
    
    // Feedback system
    if (message.match(/\b(feedback|give feedback|submit feedback|feedback system|rate|rating|review)\b/i)) {
      return 'Feedback System:\n• Visit /feedback page\n• Fill feedback form with:\n  - Name and Email\n  - Rating (1-5 stars)\n  - Your message\n• Submit feedback\n• Admin can view all feedbacks\n• Admin can delete feedbacks\n• Feedback helps improve the platform';
    }
    
    // Wishlist
    if (message.match(/\b(wishlist|save|favorite|heart|love button|add to wishlist)\b/i)) {
      return 'Wishlist Features:\n• Click ❤️ heart button on product cards\n• Add products to wishlist\n• View wishlist from dashboard\n• Remove items from wishlist\n• Wishlist persists across sessions\n• Quick access to saved products';
    }
    
    // Cart
    if (message.match(/\b(cart|shopping cart|add to cart|checkout|buy now)\b/i)) {
      return 'Shopping Cart:\n• Click "Add to Cart" on products\n• View cart from dashboard\n• Manage cart items (quantity, remove)\n• Proceed to checkout\n• Select payment method\n• Enter shipping address\n• Place order\n• Order shows as "Pending"\n• Can edit before admin approval';
    }
    
    // Home panels
    if (message.match(/\b(home|home page|home panel|buyer home|seller home)\b/i)) {
      return 'Home Panels:\n\n**Buyer Home (/buyer/home):**\n• Quick stats (orders, pending, spent, cart, wishlist)\n• Quick actions (browse, cart, wishlist, orders)\n• Recent orders\n• Featured products\n• Shopping tips\n• Payment info\n\n**Seller Home (/seller/home):**\n• Business stats (products, revenue, orders)\n• Quick actions (add product, products, orders, stats)\n• Recent orders\n• Recent products\n• Product listing tips\n• Payment & orders info';
    }
    
    // Footer
    if (message.match(/\b(footer|shop page|about page|contact page|feedback page|footer links)\b/i)) {
      return 'Footer Pages:\n• Shop (/shop) - Browse products, categories, deals, new arrivals\n• About (/about) - Our story, team, careers, blog\n• Contact (/contact) - Contact form and information\n• Feedback (/feedback) - Submit feedback\n• All footer links are functional\n• Click any footer section to open dedicated page';
    }
    
    // Statistics
    if (message.match(/\b(statistics|stats|charts|graph|analytics|data|revenue|sales)\b/i)) {
      return 'Statistics & Charts:\n\n**Buyer Stats:**\n• Total Orders\n• Pending Orders\n• Total Spent\n• Cart Items\n• Wishlist Items\n• Charts: Purchase by month, Payment methods\n\n**Seller Stats:**\n• Total Products\n• Available Products\n• Sold Products\n• Total Revenue\n• Total Orders\n• Charts: Sales by month, Payment methods\n\n**Admin Stats:**\n• Total Users, Products, Sales, Revenue\n• Bar chart: Sales revenue (last 6 months)\n• Pie chart: Products by category';
    }
    
    // Forgot password - Secure
    if (message.match(/\b(forgot password|forgot|reset password|password reset|password recovery|password bhuliyo|password birse|password change)\b/i)) {
      let response = '**Password Recovery:**\n\nCurrently, password reset is not automated. Please:\n\n1. Contact support at: support@easybuy.com\n2. Or call: +977-1234567890\n3. Provide your registered email\n4. Our support team will help you reset your password\n\n**Tip:** Keep your password safe and remember it!';
      
      // Only show admin password if user is already admin
      if (user && user.role === 'admin') {
        response += '\n\n**Admin Account (You are logged in as admin):**\nEmail: nirajanbhattarai20@gmail.com\nPassword: 1234';
      }
      
      return response;
    }
    
    // Technology stack
    if (message.match(/\b(technology|tech stack|what technology|framework|react|node|mongodb|database|backend|frontend|stack|tools|languages)\b/i)) {
      return '**Technology Stack:**\n\n**Frontend:**\n• React 18.2\n• React Router DOM\n• Axios (API calls)\n• Chart.js & react-chartjs-2 (Charts)\n• CSS3 (Styling)\n• Inter Font\n\n**Backend:**\n• Node.js\n• Express.js\n• MongoDB (Database)\n• Mongoose (ODM)\n• JWT (Authentication)\n• bcryptjs (Password hashing)\n\n**Features:**\n• RESTful API\n• Role-based access control\n• Image compression\n• Base64 image storage\n• Real-time updates';
    }
    
    // Project structure
    if (message.match(/\b(project structure|folder structure|file structure|directory|code structure|how is organized)\b/i)) {
      return '**Project Structure:**\n\n**Backend:**\n• models/ - User, Product, Order, Feedback, FooterContent\n• routes/ - auth, users, products, orders, cart, wishlist, footer, feedback\n• middleware/ - auth.js (JWT protection)\n• server.js - Main entry point\n\n**Frontend:**\n• components/\n  - Auth/ - Login\n  - Dashboard/ - Admin, Buyer, Seller\n  - Home/ - BuyerHome, SellerHome\n  - History/ - BuyHistory, SellHistory\n  - Pages/ - Shop, About, Contact, Feedback\n  - Cart, Wishlist, Footer, Toast, Loading\n• context/ - AuthContext\n• styles/ - colors.css, fonts.css\n• App.js - Routes\n\n**Database:** MongoDB (easybuy)';
    }
    
    // API endpoints
    if (message.match(/\b(api|endpoints|routes|url|endpoint|api routes|backend routes)\b/i)) {
      return '**API Endpoints:**\n\n**Authentication:**\n• POST /api/auth/register\n• POST /api/auth/login\n\n**Users:**\n• GET /api/users (admin)\n• DELETE /api/users/:id (admin)\n\n**Products:**\n• GET /api/products\n• POST /api/products (seller)\n• PUT /api/products/:id (seller)\n• DELETE /api/products/:id (seller/admin)\n\n**Orders:**\n• GET /api/orders/all (admin)\n• GET /api/orders/my-orders\n• POST /api/orders\n• PUT /api/orders/:id\n\n**Cart & Wishlist:**\n• GET/POST/DELETE /api/cart\n• GET/POST/DELETE /api/wishlist\n\n**Feedback:**\n• GET /api/feedback (admin)\n• POST /api/feedback\n• DELETE /api/feedback/:id (admin)\n\n**Footer:**\n• GET /api/footer\n• POST /api/footer (admin)';
    }
    
    // Setup and installation - Secure (only show admin credentials to admin)
    if (message.match(/\b(setup|install|installation|how to setup|how to install|run|start|setup guide|installation guide|setup kasari)\b/i)) {
      let response = '**Setup & Installation:**\n\n**Prerequisites:**\n• Node.js (v14+)\n• MongoDB (local or Atlas)\n• npm or yarn\n\n**Backend Setup:**\n1. cd backend\n2. npm install\n3. Create .env file with:\n   - MONGODB_URI\n   - JWT_SECRET\n   - PORT (default: 5000)\n4. npm run dev\n\n**Frontend Setup:**\n1. cd frontend\n2. npm install\n3. npm start\n\n**Access:**\n• Frontend: http://localhost:3000\n• Backend: http://localhost:5000\n\n**Note:** Admin account is auto-created during server startup. Contact system administrator for admin access.';
      
      // Only show admin credentials if user is already admin
      if (user && user.role === 'admin') {
        response += '\n\n**Admin Auto-Created (You are logged in as admin):**\nEmail: nirajanbhattarai20@gmail.com\nPassword: 1234';
      }
      
      return response;
    }
    
    // Error handling
    if (message.match(/\b(error|problem|issue|bug|not working|broken|fix|help|troubleshoot|error aako|problem xa|kam gardaina)\b/i)) {
      return '**Troubleshooting:**\n\n**Common Issues:**\n\n1. **Login not working:**\n   • Check email and password\n   • Select correct role\n   • Clear browser cache\n\n2. **Products not loading:**\n   • Check backend is running\n   • Check MongoDB connection\n   • Check network tab for errors\n\n3. **Image upload fails:**\n   • Max 5 images per product\n   • Max 10MB per image\n   • Supported formats: JPEG, PNG, GIF, WebP, BMP, SVG\n   • Images auto-compress if too large\n\n4. **Order not showing:**\n   • Check if admin approved\n   • Check order status\n   • Refresh page\n\n5. **403 Forbidden:**\n   • Check user role\n   • Check authentication token\n   • Re-login if needed\n\n**Still having issues?**\nContact: support@easybuy.com';
    }
    
    // Features list
    if (message.match(/\b(all features|complete features|what features|feature list|sabai features|k k features|everything|all functionality)\b/i)) {
      return '**Complete Features List:**\n\n**User Management:**\n✅ Registration (Buyer/Seller)\n✅ Login with role selection\n✅ JWT Authentication\n✅ Role-based access control\n✅ Admin auto-creation\n\n**Product Management:**\n✅ Add products (up to 5 images)\n✅ Edit/Delete products\n✅ Category dropdown\n✅ Price filters\n✅ Search functionality\n✅ 360° product viewer\n✅ Image compression\n\n**Order Management:**\n✅ Add to cart\n✅ Wishlist\n✅ Checkout process\n✅ Payment methods (COD, Card)\n✅ Order approval system\n✅ Edit pending orders\n✅ Order history\n✅ Status tracking\n\n**Dashboard Features:**\n✅ Buyer dashboard (browse, cart, orders)\n✅ Seller dashboard (products, orders, stats)\n✅ Admin dashboard (users, products, orders, feedback)\n✅ Statistics and charts\n✅ Home panels\n\n**Additional Features:**\n✅ Footer pages (Shop, About, Contact, Feedback)\n✅ Toast notifications\n✅ Loading animations\n✅ Responsive design\n✅ Inter font\n✅ 2-color scheme\n✅ Virtual Assistant (me!)';
    }
    
    // Default response - More helpful
    const defaultResponse = knowledgeBase.default[Math.floor(Math.random() * knowledgeBase.default.length)];
    return defaultResponse + '\n\n**Try asking:**\n• "How to login?"\n• "Admin credentials?"\n• "How to buy?"\n• "How to sell?"\n• "Order approval?"\n• "Dashboard features?"\n• "Payment methods?"\n• "Available products?"\n\nOr ask me anything specific about Easy Buy!';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        text: userMessage,
        timestamp: new Date()
      }
    ]);
    setInputValue('');

    // Simulate thinking delay
    setTimeout(() => {
      const botResponse = getResponse(userMessage);
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          text: botResponse,
          timestamp: new Date()
        }
      ]);
    }, 500);
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
    // Auto send after setting value
    setTimeout(() => {
      const userMessage = question;
      setMessages(prev => [
        ...prev,
        {
          type: 'user',
          text: userMessage,
          timestamp: new Date()
        }
      ]);

      setTimeout(() => {
        const botResponse = getResponse(userMessage);
        setMessages(prev => [
          ...prev,
          {
            type: 'bot',
            text: botResponse,
            timestamp: new Date()
          }
        ]);
      }, 500);
    }, 100);
  };

  const quickQuestions = [
    'How to login?',
    'How to buy products?',
    'How to sell products?',
    'Order approval process?',
    'Dashboard features?',
    'Payment methods?',
    'Registration process?',
    'All features?'
  ];

  return (
    <>
      <div 
        className={`virtual-assistant-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Virtual Assistant"
      >
        <span className="assistant-icon">🤖</span>
        {!isOpen && <span className="pulse-ring"></span>}
      </div>

      {isOpen && (
        <div className="virtual-assistant-window">
          <div className="assistant-header">
            <div className="assistant-header-info">
              <span className="assistant-avatar">🤖</span>
              <div>
                <h3>Easy Buy Assistant</h3>
                <p>We're here to help!</p>
              </div>
            </div>
            <button 
              className="close-assistant-btn"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ×
            </button>
          </div>

          <div className="assistant-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-content">
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="quick-questions">
              <p className="quick-questions-title">Quick Questions:</p>
              <div className="quick-questions-grid">
                {quickQuestions.map((q, index) => (
                  <button
                    key={index}
                    className="quick-question-btn"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="assistant-input-form" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about Easy Buy..."
              className="assistant-input"
            />
            <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default VirtualAssistant;

