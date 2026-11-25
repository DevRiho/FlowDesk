import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Workspace name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workspace must have an owner'],
      index: true,
    },
    settings: {
      currency: {
        type: String,
        default: 'USD',
        uppercase: true,
        trim: true,
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      dateFormat: {
        type: String,
        default: 'MMM DD, YYYY',
      },
      logo: {
        type: String,
        default: '',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual relationship to populate team members belonging to this workspace
workspaceSchema.virtual('members', {
  ref: 'TeamMember',
  localField: '_id',
  foreignField: 'workspace',
});

// Helper to generate a URL-friendly slug from name
workspaceSchema.statics.generateSlug = function (name) {
  const base = name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
};

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;

