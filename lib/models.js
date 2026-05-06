import mongoose, { Schema, model, models } from 'mongoose';

const QuizScoreSchema = new Schema({
  quizId:         { type: String, required: true },
  score:          { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  timestamp:      { type: Date, default: Date.now },
}, { _id: false });

const UserProgressSchema = new Schema({
  userId:           { type: String, required: true, unique: true, index: true },
  name:             { type: String, default: 'Student' },
  email:            { type: String, required: true, index: true },
  totalPoints:      { type: Number, default: 0, index: true },
  questionsSolved:  { type: Number, default: 0 },
  chapterProgress:  { type: Map, of: Number, default: {} },
  recentActivity:   { type: [Schema.Types.Mixed], default: [] },
  badges:           { type: [String], default: [] },
  examHistory:      { type: [Schema.Types.Mixed], default: [] },
  quizScores:       { type: [QuizScoreSchema], default: [] },
  finalExamDone:    { type: Boolean, default: false },
  notifications:    { type: [Schema.Types.Mixed], default: [] },
  password:         { type: String }, // For custom auth users
  authSource:       { type: String, default: 'clerk' }, // 'clerk' or 'custom'
  updatedAt:        { type: Date, default: Date.now },
});

export const UserProgress =
  models.UserProgress || model('UserProgress', UserProgressSchema);
