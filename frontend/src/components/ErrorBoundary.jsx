/**
 * ============================================
 * ERROR BOUNDARY COMPONENT
 * ============================================
 * Catch JavaScript errors anywhere in child component tree
 * and display fallback UI instead of crashing the whole app
 * 
 * FEATURES:
 * - Catch errors in render phase
 * - Log errors to console (can be extended to error tracking service)
 * - Display user-friendly error message
 * - Reload button to recover
 * - Prevent entire app crash
 * 
 * USAGE:
 * Wrap any component tree that might have errors:
 * 
 * <ErrorBoundary>
 *   <ProductList />
 * </ErrorBoundary>
 * 
 * @module ErrorBoundary
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when error occurs
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Log error details for debugging
   */
  componentDidCatch(error, errorInfo) {
    // Log to console
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error details in state
    this.setState({
      error,
      errorInfo
    });

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // logErrorToService(error, errorInfo);
  }

  /**
   * Reset error state and reload
   */
  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  /**
   * Go back to home page
   */
  handleGoHome = () => {
    window.location.href = '/landing';
  };

  render() {
    if (this.state.hasError) {
      // ========================================
      // ERROR FALLBACK UI
      // ========================================
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-12 h-12 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Oops! Terjadi Kesalahan
            </h1>
            
            <p className="text-gray-600 mb-6">
              Maaf, terjadi kesalahan yang tidak terduga. 
              Tim kami akan segera memperbaikinya.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 text-left">
                <details className="bg-gray-50 rounded p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                    Detail Error (Dev Only)
                  </summary>
                  <div className="text-xs text-red-600 font-mono overflow-auto max-h-40">
                    <p className="font-bold mb-2">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Muat Ulang Halaman
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Kembali ke Beranda
              </button>
            </div>

            {/* Help Text */}
            <p className="mt-6 text-sm text-gray-500">
              Jika masalah terus berlanjut, silakan hubungi{' '}
              <a 
                href="mailto:baletaniinfo@gmail.com" 
                className="text-green-600 hover:text-green-700 font-medium"
              >
                customer support
              </a>
            </p>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
