import PropTypes from "prop-types";

/**
 * Loading Spinner Component
 */
const LoadingSpinner = ({ size = "medium", color = "#e50914" }) => {
  const sizeStyles = {
    small: { width: "20px", height: "20px", borderWidth: "2px" },
    medium: { width: "40px", height: "40px", borderWidth: "3px" },
    large: { width: "60px", height: "60px", borderWidth: "4px" }
  };

  const style = {
    ...sizeStyles[size],
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderTopColor: color,
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  };

  return <div style={style} />;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  color: PropTypes.string
};

/**
 * Loading Page Component
 */
const LoadingPage = ({ message = "Loading..." }) => {
  return (
    <div style={pageStyles.container}>
      <LoadingSpinner size='large' />
      <p style={pageStyles.message}>{message}</p>
    </div>
  );
};

LoadingPage.propTypes = {
  message: PropTypes.string
};

/**
 * Loading Section Component (for inline loading)
 */
const LoadingSection = ({ rows = 4 }) => {
  return (
    <div style={sectionStyles.container}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} style={sectionStyles.skeleton} />
      ))}
    </div>
  );
};

LoadingSection.propTypes = {
  rows: PropTypes.number
};

const pageStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh",
    gap: "16px"
  },
  message: {
    color: "#999",
    fontSize: "1rem"
  }
};

const sectionStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "20px"
  },
  skeleton: {
    height: "100px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    animation: "pulse 1.5s ease-in-out infinite"
  }
};

export { LoadingSpinner, LoadingPage, LoadingSection };
export default LoadingSpinner;
