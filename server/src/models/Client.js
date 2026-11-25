import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Client must belong to a workspace'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Client primary contact name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Client company or organization name is required'],
      trim: true,
      maxlength: [100, 'Company cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'LEAD', 'INACTIVE', 'ARCHIVED'],
        message: '{VALUE} is not a valid client status',
      },
      default: 'ACTIVE',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    portalUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual relationship to list all projects belonging to this client
clientSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'client',
});

// Virtual relationship to list all invoices billed to this client
clientSchema.virtual('invoices', {
  ref: 'Invoice',
  localField: '_id',
  foreignField: 'client',
});

// Index to quickly search clients within a workspace by name, company, or email
clientSchema.index({ workspace: 1, name: 'text', company: 'text', email: 'text' });

const Client = mongoose.model('Client', clientSchema);
export default Client;

