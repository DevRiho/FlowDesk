import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setLoading(true);
      await authService.forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setServerError('Unable to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-surface-900">Reset your password</h2>
        <p className="text-sm text-surface-500 mt-1">
          Enter your account email and we'll send you instructions to reset your password.
        </p>
      </div>

      {success ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-semibold text-surface-900 text-sm">Check your inbox</h4>
          <p className="text-xs text-surface-600 mt-1">
            If an account exists with that address, we have dispatched a password reset link.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            &larr; Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              {...register('email')}
              className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
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
                <Mail className="h-4 w-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-xs text-surface-500 hover:text-surface-700 font-medium"
            >
              &larr; Return to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

