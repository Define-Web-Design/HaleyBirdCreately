import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from './components/ui/toaster';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './hooks/useAuth';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);