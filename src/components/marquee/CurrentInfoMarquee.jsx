import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentInfo } from "./fetchCurrentInfo";
import { Alert } from "antd";
import useResponsive from "../../hooks/useResponsive";

const CurrentInfoMarquee = () => {
  const { isMobile, responsive } = useResponsive();
  const { data, isLoading, error } = useQuery({
    queryKey: ["current-info-marquee"],
    queryFn: fetchCurrentInfo,
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  if (isLoading) return null; // Or show a loading spinner if you prefer
  if (error) return <Alert type="error" message="Failed to load current info" banner />;

  if (!data?.currentInfo) return null;

  return (
    <div style={{
      overflow: "hidden",
      whiteSpace: "nowrap",
      padding: responsive({ xs: "2px 6px", sm: "4px 10px", md: "10px 20px", lg: "10px 20px", xl: "10px 20px" }),
      fontWeight: "bold",
      flex: 1,
      minWidth: 0,
      fontSize: responsive({ xs: "11px", sm: "12px", md: "13px", lg: "14px", xl: "14px" }),
      color: "var(--marquee-text)",
      ...(isMobile ? { order: 3, width: "100%", flex: "none" } : {}),
    }}>
      <div style={{
        display: "inline-block",
        paddingLeft: "100%",
        animation: `scroll-left ${isMobile ? "10s" : "15s"} linear infinite`
      }}>
        {data.currentInfo}
      </div>
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default CurrentInfoMarquee;
