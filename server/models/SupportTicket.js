import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["admin", "user"],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional if someone sends a query without being logged in, but user wants "Logged-in users should see..."
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "New",
    enum: ["New", "Pending", "Resolved"]
  },
  replies: [replySchema]
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportTicketSchema);
