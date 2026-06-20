import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:24}}>
          <h2 style={{color:'#c53030'}}>Something went wrong rendering the admin UI.</h2>
          <p style={{color:'#333'}}>Error: {String(this.state.error?.message || this.state.error)}</p>
          <details style={{whiteSpace:'pre-wrap', marginTop:12}}>
            {this.state.info?.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
