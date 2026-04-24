import { Card } from "antd";
import useResponsive from "../hooks/useResponsive";

const InfoCard = ({ title, subtitle, children, padding }) => {
  const { responsive } = useResponsive();
  const cardPadding = padding || responsive({ xs: "8px", sm: "10px", md: "10px", lg: "12px", xl: "12px" });

  return (
    <Card
     styles={{ body: { padding: cardPadding } }}
      style={{
        borderRadius: "8px",
        background: "var(--card-bg)",
      }}
      className="info-card"
    >
      <h3 style={{ fontSize: responsive({ xs: "0.85rem", md: "0.9rem", xl: "1rem" }), fontWeight: "bold", color: "var(--chart-heading-text)" }}>{title}</h3>
      {subtitle && <p style={{ marginBottom: responsive({ xs: "0.5rem", xl: "1rem" }), color: "var(--chart-heading-text)" }}>{subtitle}</p>}
      {children}
    </Card>
  );
};

export default InfoCard;

