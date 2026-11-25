import mongoose from 'mongoose';

// TeamMember acts as the junction model linking Users to Workspaces.
// This allows a single user to belong to multiple workspaces with distinct roles
// (e.g., OWNER in their own workspace, but MEMBER in a client's agency workspace).
const teamMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: {
        values: ['OWNER', 'ADMIN', 'MEMBER', 'CLIENT'],
        message: '{VALUE} is not a valid team role',
      },
      default: 'MEMBER',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Team Member',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INVITED', 'DEACTIVATED'],
      default: 'ACTIVE',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index ensures a user cannot be added twice to the exact same workspace
teamMemberSchema.index({ user: 1, workspace: 1 }, { unique: true });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
export default TeamMember;

