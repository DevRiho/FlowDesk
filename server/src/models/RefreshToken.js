import mongoose from 'mongoose';

// RefreshToken model tracks active refresh token sessions.
// Storing refresh tokens in the database allows us to support instant session revocation,
// single-device logout, "log out of all devices", and token reuse detection.
const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL (Time-To-Live) index automatically purges expired refresh tokens
      // from the database, preventing storage bloat over time.
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;

