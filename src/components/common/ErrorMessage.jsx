import PropTypes from "prop-types";

/**
 * Error Message Component
 * Displays error messages in a consistent way
 */
const ErrorMessage = ({
  title = "Error",
  message = "Something went wrong",
  onRetry,
  variant = "default"
}) => {
  const variantStyles = {
    default: {
      container: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "#ef4444"
      },
      icon: "⚠️"
    },
    warning: {
      container: {
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "#f59e0b"
      },
      icon: "⚡"
    },
    info: {
      container: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "#3b82f6"
      },
      icon: "ℹ️"
    }
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div style={containerStyles.wrapper}>
      <div style={{ ...containerStyles.container, ...style.container }}>
        <span style={containerStyles.icon}>{style.icon}</span>
        <div style={containerStyles.content}>
          <h3 style={containerStyles.title}>{title}</h3>
          <p style={containerStyles.message}>{message}</p>
        </div>
        {onRetry && (
          <button onClick={onRetry} style={containerStyles.button}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  variant: PropTypes.oneOf(["default", "warning", "info"])
};

const containerStyles = {
  wrapper: {
    padding: "20px",
    display: "flex",
    justifyContent: "center"
  },
  container: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid",
    maxWidth: "500px",
    backgroundColor: "rgba(239, 68, 68, 0.1)"
  },
  icon: {
    fontSize: "24px",
    lineHeight: 1
  },
  content: {
    flex: 1
  },
  title: {
    margin: 0,
    marginBottom: "4px",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "600"
  },
  message: {
    margin: 0,
    color: "#999",
    fontSize: "0.875rem"
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#e50914",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.875rem",
    whiteSpace: "nowrap"
  }
};

/**
 * Network Error Component
 * Specialized error for network issues
 */
const NetworkError = ({ onRetry }) => (
  <ErrorMessage
    title='Network Error'
    message='Please check your internet connection and try again.'
    onRetry={onRetry}
    variant='warning'
  />
);

NetworkError.propTypes = {
  onRetry: PropTypes.func
};

/**
 * Not Found Error Component
 */
const NotFoundError = ({ resource = "Resource", onGoHome }) => (
  <ErrorMessage
    title='Not Found'
    message={`The ${resource} you're looking for doesn't exist.`}
    onRetry={onGoHome}
    variant='info'
  />
);

NotFoundError.propTypes = {
  resource: PropTypes.string,
  onGoHome: PropTypes.func
};

export { ErrorMessage, NetworkError, NotFoundError };
export default ErrorMessage;
