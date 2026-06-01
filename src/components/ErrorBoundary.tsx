import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0b0e] flex items-center justify-center p-4 font-mono text-zinc-300">
          <div className="max-w-2xl w-full bg-[#111318] border border-red-500/30 rounded-xl p-8 shadow-2xl">
            <h1 className="text-xl font-bold text-red-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Runtime Exception
            </h1>
            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-red-300/80 mb-6 overflow-auto border border-red-900/50">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded focus:outline-none transition-colors uppercase text-xs font-bold tracking-widest"
            >
              Reboot Environment
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
