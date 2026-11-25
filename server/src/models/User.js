import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      // select: false prevents the password hash from being returned in standard queries
      // like User.find() or User.findById(), protecting against accidental hash leaks.
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['OWNER', 'ADMIN', 'MEMBER', 'CLIENT'],
        message: '{VALUE} is not a valid FlowDesk role',
      },
      default: 'OWNER',
    },
    avatar: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Password reset fields
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Mongoose pre-save hook to hash password before saving to the database.
// Only hashes if the password field was actually modified, avoiding re-hashing
// when updating other profile fields (like name or avatar).
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Salt rounds = 12 strikes a strong balance between security against brute-force
  // and CPU performance on authentication requests.
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // If user changed password after document creation, update passwordChangedAt
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000); // 1 sec in past ensures token issued after
  }

  next();
});

// Instance method to compare plain-text password with hashed password in database
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user changed password after a given JWT timestamp
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// Generate and hash a secure password reset token
userSchema.methods.createPasswordResetToken = function () {
  // Generate unhashed random 32-byte hex token to send via email
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token before storing in database (so database compromises don't leak reset tokens)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 1 hour
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;

