import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain an uppercase letter, lowercase letter, and number'
    ),
  companyName: z.string().min(2, 'Company or workspace name is required'),
});

export default function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setLoading(true);
      await registerAuth(data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Failed to register account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-surface-900">Account Created!</h3>
        <p className="text-sm text-surface-600 mt-1">
          Redirecting you to the login screen...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-surface-900">Create your FlowDesk account</h2>
        <p className="text-sm text-surface-500 mt-1">
          Start managing clients, projects, and invoices seamlessly.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Jane Doe"
            {...register('name')}
            className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5">
            Company / Workspace Name
          </label>
          <input
            type="text"
            placeholder="Apex Creative Agency"
            {...register('companyName')}
            className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
          {errors.companyName && (
            <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5">
            Work Email
          </label>
          <input
            type="email"
            placeholder="jane@apex.com"
            {...register('email')}
            className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="At least 8 characters (1 uppercase, 1 number)"
            {...register('password')}
            className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm text-sm transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Get Started</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-surface-500">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
}

