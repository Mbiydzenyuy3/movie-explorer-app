import { Component } from "react";
import PropTypes from "prop-types";

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom error fallback UI
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          retry: this.handleRetry
        });
      }

      // Default error UI
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div style={styles.actions}>
              <button onClick={this.handleRetry} style={styles.retryButton}>
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                style={styles.homeButton}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#000",
    color: "#fff",
    padding: "20px"
  },
  content: {
    textAlign: "center",
    maxWidth: "500px"
  },
  title: {
    fontSize: "2rem",
    marginBottom: "16px",
    color: "#ff4444"
  },
  message: {
    fontSize: "1rem",
    marginBottom: "24px",
    color: "#999"
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center"
  },
  retryButton: {
    padding: "12px 24px",
    backgroundColor: "#e50914",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem"
  },
  homeButton: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid #fff",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem"
  }
};

export default ErrorBoundary;
