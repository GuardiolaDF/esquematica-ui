import React from 'react';
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'white', background: 'red', padding: '20px', whiteSpace: 'pre-wrap', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <h2>Fatal React Error</h2>
          <details>
            <summary>Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.info && this.state.info.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
