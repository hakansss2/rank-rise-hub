const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

// Improved CORS settings - include Glitch domains
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://rankrisehub.netlify.app', 'https://www.rankrisehub.netlify.app', 
       'https://e6d75c2d-6fff-4293-8358-83b61117fd89.lovableproject.com', 
       'https://forested-saber-sandal.glitch.me'] 
    : 'http://localhost:5173',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '1mb' })); // Limit payload size

// MongoDB bağlantı URI'sini konsola yazdır (şifreyi gizleyerek)
const connectionURI = process.env.MONGODB_URI || 'MongoDB URI bulunamadı';
const sanitizedURI = connectionURI.replace(/(:.*@)/g, ':***@');
console.log("MongoDB bağlantı URI'si:", sanitizedURI);
console.log("Çalışma ortamı:", process.env.NODE_ENV);
console.log("Sunucu portu:", process.env.PORT);

// Optimize MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Reduced for faster failures
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  family: 4, // Use IPv4, skip trying IPv6
  // Use a smaller connection pool for Glitch
  poolSize: process.env.MONGODB_POOL_SIZE || 5
};

// Connect to MongoDB with improved error handling
mongoose
  .connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => console.log("MongoDB bağlantısı başarılı"))
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err);
    console.error("Hata detayları:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      hostname: err.hostname
    });
  });

// Add MongoDB connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Require models
const User = require("./models/User");
const Order = require("./models/Order");

// Super lightweight health check that doesn't depend on MongoDB
app.get("/health-fast", (req, res) => {
  res.status(200).send({ status: "server-running" });
});

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(5000, () => {
    console.log('Request timeout for:', req.path);
  });
  next();
});

// Kullanıcı Rotaları
app.post("/api/users/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    // E-posta kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta adresi zaten kullanılıyor." });
    }
    
    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Yeni kullanıcı oluştur
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role: "customer",
      balance: 0
    });
    
    const savedUser = await newUser.save();
    
    // Şifreyi gizle
    const userResponse = { ...savedUser._doc };
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Admin kontrolü (gerçek uygulamada DB'den gelmeli)
    if (email === "hakan200505@gmail.com" && password === "Metin2398@") {
      return res.status(200).json({
        id: "1",
        email: "hakan200505@gmail.com",
        username: "admin",
        role: "admin",
        balance: 5000
      });
    }
    
    // Normal kullanıcı kontrolü
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Geçersiz e-posta veya şifre." });
    }
    
    // Şifre doğrulama
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Geçersiz e-posta veya şifre." });
    }
    
    // Şifreyi gizle
    const userResponse = { ...user._doc };
    delete userResponse.password;
    
    res.status(200).json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Kullanıcı sayısını getir - düzeltildi ve yeni yol eklendi
app.get("/api/users/count", async (req, res) => {
  try {
    const count = await User.countDocuments({ role: "customer" });
    console.log("Kullanıcı sayısı isteği, sonuç:", count);
    res.status(200).json({ count });
  } catch (err) {
    console.error("Kullanıcı sayısı isteği hatası:", err);
    res.status(500).json({ message: err.message });
  }
});

// Sipariş Rotaları
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().lean().exec();
    console.log(`${orders.length} sipariş bulundu`);
    res.json(orders);
  } catch (err) {
    console.error("Sipariş getirme hatası:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  const { userId, currentRank, targetRank, price, gameUsername, gamePassword } = req.body;
  
  try {
    const newOrder = new Order({
      userId,
      currentRank,
      targetRank,
      price,
      status: "pending",
      createdAt: new Date().toISOString(),
      messages: [],
      gameUsername,
      gamePassword
    });
    
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch("/api/orders/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/api/orders/:id/messages", async (req, res) => {
  try {
    const { senderId, senderName, content } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }
    
    const newMessage = {
      id: Date.now().toString(),
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString()
    };
    
    order.messages.push(newMessage);
    await order.save();
    
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Kullanıcı bakiyesi güncelleme
app.patch("/api/users/:id/balance", async (req, res) => {
  try {
    const { amount } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    
    user.balance += Number(amount);
    const updatedUser = await user.save();
    
    // Şifreyi gizle
    const userResponse = { ...updatedUser._doc };
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Ana Endpoint
app.get("/", (req, res) => {
  res.send("Rank Rise Hub Backend Çalışıyor! API endpointleri /api altında erişilebilir.");
});

// Glitch için ping endpointi (uyku moduna girmesini önlemek için)
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Health check endpoint with improved details
app.get("/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  let statusText;
  
  switch(mongoStatus) {
    case 0: statusText = "disconnected"; break;
    case 1: statusText = "connected"; break;
    case 2: statusText = "connecting"; break;
    case 3: statusText = "disconnecting"; break;
    default: statusText = "unknown";
  }
  
  res.status(200).json({ 
    status: "up", 
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    server: "active",
    mongodb: statusText
  });
});

// Start server with reduced timeout
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor.`));

// Add server timeout handling - reduce timeout periods
server.timeout = 10000; // 10 second timeout

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
