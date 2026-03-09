import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  LoadingSpinner,
  LoadingPage,
  LoadingSection
} from "../components/common/Loading";

describe("Loading Components", () => {
  describe("LoadingSpinner", () => {
    it("should render with default size", () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.firstChild;
      expect(spinner).toBeInTheDocument();
    });

    it("should render with small size", () => {
      const { container } = render(<LoadingSpinner size='small' />);
      const spinner = container.firstChild;
      expect(spinner).toBeInTheDocument();
    });

    it("should render with large size", () => {
      const { container } = render(<LoadingSpinner size='large' />);
      const spinner = container.firstChild;
      expect(spinner).toBeInTheDocument();
    });

    it("should render with custom color", () => {
      const { container } = render(<LoadingSpinner color='#ff0000' />);
      const spinner = container.firstChild;
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("LoadingPage", () => {
    it("should render with default message", () => {
      render(<LoadingPage />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render with custom message", () => {
      render(<LoadingPage message='Fetching data...' />);
      expect(screen.getByText("Fetching data...")).toBeInTheDocument();
    });
  });

  describe("LoadingSection", () => {
    it("should render with default rows", () => {
      const { container } = render(<LoadingSection />);
      const skeletons = container.querySelectorAll("div");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should render with custom row count", () => {
      const { container } = render(<LoadingSection rows={2} />);
      const skeletons = container.querySelectorAll("div");
      // Container wrapper + 2 skeleton rows = 3 divs total
      expect(skeletons.length).toBeGreaterThanOrEqual(2);
    });
  });
});
