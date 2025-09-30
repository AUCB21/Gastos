import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Algo salió mal!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Ocurrió un error inesperado. Por favor, intenta recargar la página.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-dodger-blue-600 hover:bg-dodger-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar Página
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4 transition-colors"
              >
                Reintentar
              </button>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalles del error (desarrollo)
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-700 overflow-auto">
                  <div className="font-medium mb-1">Error:</div>
                  <div className="mb-2">{this.state.error.toString()}</div>
                  <div className="font-medium mb-1">Stack trace:</div>
                  <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;