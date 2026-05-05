const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const uri = 'mongodb+srv://ruby:1asdfghjkl2zxcvbnm@cluster0.sluq2ca.mongodb.net/farooq-platform?retryWrites=true&w=majority&appName=Cluster0';

const UserProgressSchema = new Schema({
  userId:           { type: String, required: true, unique: true, index: true },
  name:             { type: String, default: 'Student' },
  email:            { type: String, required: true, index: true },
  totalPoints:      { type: Number, default: 0, index: true },
});

const UserProgress = models.UserProgress || model('UserProgress', UserProgressSchema);

async function testConnection() {
  try {
    await mongoose.connect(uri);
    
    const db = mongoose.connection.db;
    
    const topStudents = await UserProgress.find({ totalPoints: { $exists: true } })
      .sort({ totalPoints: -1 })
      .limit(20)
      .lean();

    console.log('\n--- Leaderboard Check ---');
    console.log(JSON.stringify(topStudents, null, 2));

  } catch (error) {
    console.error(error.message);
  } finally {
    mongoose.connection.close();
  }
}

testConnection();
