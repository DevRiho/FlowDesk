import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().min(2, 'Company name is required').max(100),
  phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'LEAD', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export const updateClientSchema = createClientSchema.partial();

export const createProjectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().optional(),
  client: z.string().min(1, 'Client ID is required'),
  assignedMembers: z.array(z.string()).optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  startDate: z.string().optional(),
  deadline: z.string().min(1, 'Deadline date is required'),
  budget: z.number().min(0).default(0),
  tags: z.array(z.string()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createTaskSchema = z.object({
  project: z.string().min(1, 'Project ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().optional().nullable(),
  estimatedHours: z.number().min(0).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

