import mongoose from 'mongoose';

/**
 * Connect to MongoDB
 */
export async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mochi';
    
    await mongoose.connect(mongoUri);
    
    console.log('✧ database connected successfully');
  } catch (error) {
    console.error('✧ failed to connect to database:', error.message);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  weeklyMessages: { type: Number, default: 0 },
  lastXpTime: { type: Number, default: 0 },
}, { timestamps: true });

// Giveaway Schema
const giveawaySchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true, index: true },
  channelId: { type: String, required: true },
  prize: { type: String, required: true },
  winnerCount: { type: Number, required: true },
  endTime: { type: Number, required: true },
  hostId: { type: String, required: true },
  ended: { type: Boolean, default: false },
  entries: [{ type: String }], // Array of user IDs
}, { timestamps: true });

// Question Schema
const questionUsedSchema = new mongoose.Schema({
  question: { type: String, required: true },
  usedAt: { type: Date, default: Date.now },
});

// Export models
export const User = mongoose.model('User', userSchema);
export const Giveaway = mongoose.model('Giveaway', giveawaySchema);
export const QuestionUsed = mongoose.model('QuestionUsed', questionUsedSchema);

export default mongoose;
