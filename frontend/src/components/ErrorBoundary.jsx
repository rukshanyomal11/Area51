import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 bg-blue-500 text-white p-2 rounded"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;