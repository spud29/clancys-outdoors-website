'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to your error reporting service
    console.error('Global error:', error);
    
    // You can integrate with Sentry or other error tracking services here
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Something went wrong!
              </h1>
              <p className="text-gray-600 mb-2">
                We apologize for the inconvenience. An unexpected error has occurred.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 p-4 bg-red-50 rounded-lg text-left">
                  <summary className="cursor-pointer font-medium text-red-900 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-sm text-red-800 whitespace-pre-wrap overflow-auto">
                    {error.message}
                    {error.stack && `\n\nStack trace:\n${error.stack}`}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={reset}
                className="w-full"
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
              <p>
                If this problem persists, please contact our{' '}
                <a 
                  href="mailto:support@clancysoutdoors.com" 
                  className="text-blue-600 hover:underline"
                >
                  support team
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 