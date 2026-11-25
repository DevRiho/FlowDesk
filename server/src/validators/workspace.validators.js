import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
});

export const addTeamMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'MEMBER', 'CLIENT']).default('MEMBER'),
  title: z.string().max(100).optional(),
});

export const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'CLIENT']).optional(),
  title: z.string().max(100).optional(),
});

