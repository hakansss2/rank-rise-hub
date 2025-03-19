
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  }
});

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  currentRank: {
    type: Number,
    required: true,
  },
  targetRank: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  boosterId: {
    type: String,
  },
  boosterUsername: {
    type: String,
  },
  createdAt: {
    type: String,
    required: true,
  },
  messages: [MessageSchema],
  gameUsername: {
    type: String,
  },
  gamePassword: {
    type: String,
  }
});

module.exports = mongoose.model("Order", OrderSchema);
