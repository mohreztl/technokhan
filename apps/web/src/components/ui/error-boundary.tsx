'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Send error to monitoring service (Sentry, etc.)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              یک خطا رخ داده است
            </h2>
            
            <p className="text-muted-foreground mb-6">
              متأسفانه مشکلی پیش آمده است. لطفاً دوباره تلاش کنید یا به صفحه اصلی بازگردید.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-500/10 rounded-xl text-right overflow-auto max-h-40">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="h-4 w-4 text-red-500" />
                  <span className="font-mono text-sm text-red-500">
                    {this.state.error.name}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                تلاش مجدد
              </Button>
              <Button onClick={this.handleGoHome} variant="primary" className="gap-2">
                <Home className="h-4 w-4" />
                صفحه اصلی
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WithErrorBoundary = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundary;
}

// Simpler error fallback component for sections
export function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error?: Error; 
  resetErrorBoundary?: () => void;
}) {
  return (
    <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
      <p className="text-muted-foreground mb-4">
        خطا در بارگذاری این بخش
      </p>
      {resetErrorBoundary && (
        <Button onClick={resetErrorBoundary} variant="outline" size="sm">
          تلاش مجدد
        </Button>
      )}
    </div>
  );
}
