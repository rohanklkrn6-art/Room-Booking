import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Intentionally silent — no console exposure of error details in production
    void error; void info;
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Something went wrong</div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 20, lineHeight: 1.5 }}>
          An unexpected error occurred. Tap below to reload.
        </div>
        <button
          style={{
            padding: '9px 20px', background: '#E8821A', color: 'white',
            border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
          onClick={() => window.location.reload()}
        >
          Reload app
        </button>
      </div>
    );
  }
}
