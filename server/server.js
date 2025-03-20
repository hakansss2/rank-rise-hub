
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

// Production için CORS ayarları
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://rankrisehub.netlify.app', 'https://www.rankrisehub.netlify.app'] 
    : 'http://localhost:5173', // Vite'ın varsayılan portu
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB bağlantı URI'sini konsola yazdır (şifreyi gizleyerek)
const connectionURI = process.env.MONGODB_URI || 'MongoDB URI bulunamadı';
const sanitizedURI = connectionURI.replace(/(:.*@)/g, ':***@');
console.log("MongoDB bağlantı URI'si:", sanitizedURI);

// MongoDB'ye bağlan
mongoose
  .connect(process.env.MONGODB_URI)
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
    
    if (err.message && err.message.includes('ENOTFOUND')) {
      console.log("Hata detayı: Cluster adı yanlış olabilir. MongoDB Atlas'ta cluster adınızı kontrol edin.");
    }
  });

// Kullanıcı modelini dahil et
const User = require("./models/User");
// Sipariş modelini dahil et
const Order = require("./models/Order");

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

// Kullanıcı sayısını getir - endpoint düzeltildi
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
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
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
  res.send("Rank Rise Hub Backend Çalışıyor!");
});

// Production için statik dosyaları serv et (opsiyonel - eğer backend ve frontend aynı sunucuda olacaksa)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor.`));
