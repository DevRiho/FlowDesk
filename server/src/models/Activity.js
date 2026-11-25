import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Activity must belong to a workspace'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'PROJECT_CREATED',
        'PROJECT_UPDATED',
        'PROJECT_COMPLETED',
        'TASK_CREATED',
        'TASK_COMPLETED',
        'TASK_UPDATED',
        'CLIENT_CREATED',
        'CLIENT_UPDATED',
        'INVOICE_CREATED',
        'INVOICE_SENT',
        'INVOICE_PAID',
        'DELIVERABLE_APPROVED',
        'MEMBER_JOINED',
      ],
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Project', 'Task', 'Client', 'Invoice', 'TeamMember'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast chronological activity feed queries
activitySchema.index({ workspace: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;

