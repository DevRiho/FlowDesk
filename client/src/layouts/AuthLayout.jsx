import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3">
          <div className="h-10 w-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
            FD
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-surface-900">
            FlowDesk
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-surface-200 rounded-2xl sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

