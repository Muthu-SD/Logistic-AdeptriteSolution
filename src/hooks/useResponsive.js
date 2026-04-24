import { useState, useEffect } from "react";

/**
 * Custom hook for responsive values based on window width.
 * Returns breakpoint info and a helper to pick values per breakpoint.
 */
const useResponsive = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setWidth(window.innerWidth), 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isLaptop = width >= 1024 && width < 1440;
  const isDesktop = width >= 1440;

  /**
   * Pick a value based on current breakpoint.
   * @param {{ xs?: any, sm?: any, md?: any, lg?: any, xl?: any }} values
   * xs: <576, sm: 576-767, md: 768-1023, lg: 1024-1439, xl: 1440+
   */
  const responsive = (values) => {
    if (width >= 1440 && values.xl !== undefined) return values.xl;
    if (width >= 1024 && values.lg !== undefined) return values.lg;
    if (width >= 768 && values.md !== undefined) return values.md;
    if (width >= 576 && values.sm !== undefined) return values.sm;
    return values.xs !== undefined ? values.xs : values.sm ?? values.md ?? values.lg ?? values.xl;
  };

  return { width, isMobile, isTablet, isLaptop, isDesktop, responsive };
};

export default useResponsive;
