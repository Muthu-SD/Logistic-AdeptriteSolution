import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "@tanstack/react-query";
import { fetchTransitLeadTimeData } from "./fetchTransitLeadTimeData";
import { Select, Button, Modal, Spin, DatePicker, Segmented } from "antd";
import { ExpandOutlined, AreaChartOutlined, LineChartOutlined } from "@ant-design/icons";
import NoDataFallback from "../../common/NoDataFallback";
import { useOrganizationData } from "../../../hooks/useOrganizationData";
import useStore from "../../../store/UseStore";
import useResponsive from "../../../hooks/useResponsive";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

const TransitLeadTimeChart = () => {
  const { data: orgData } = useOrganizationData();
  const { responsive } = useResponsive();
  const theme = useStore((state) => state.theme);
  const chartColor = theme === "dark" ? "#60a5fa" : "#3b82f6";
  const title = orgData?.chartTitles?.transitLeadTime || "Transit Lead Time";
  const [isFullView, setIsFullView] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["transit-lead-time-data", "Month"], // Default groupBy
    queryFn: () => fetchTransitLeadTimeData("Month"),
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  const chartData = (data || []).slice(0, 7); // Dashboard view: max 7
  const categories = chartData.map((item) => item.group.split(" ")[0]);
  const seriesData = chartData.map((item) => item.averageTransitTime);

  const chartOptions = {
      theme: { mode: theme },
    chart: { 
      id: "transit-lead-time", 
      toolbar: { show: false },
      background: "transparent",
          animations: {
      enabled: true,
      easing: "easeinout",
      speed: 1200,
      animateGradually: {
        enabled: true,
        delay: 200,
      },
          
    },
    dropShadow: {
        enabled: true,
        // top: 8,
        // right: 20,
        // bottom: 15,
        left: 15,
        blur: 4,
        opacity: 0.7,
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "9px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Transit Lead Time (days)",
        style: { fontSize: "10px", fontWeight: 600, color: theme === "dark" ? "#e0e0e0" : "#333" },
      },
    },
    // title: {
    //   text: "Transit Lead Time",
    //   style: { fontSize: "12px" },
    //   align: "center",
    // },
    stroke: { curve: "smooth", width:[6,5] , colors: [chartColor], lineCap: "round" },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: chartColor, opacity: 0.4 },
          { offset: 100, color: chartColor, opacity: 0.1 },
        ],
      },
    },
    dataLabels: { enabled: false },
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
         <h6  className="dashboard-chart-heading">{title}</h6>
        <Button  style={{ height: 18,width: 18, fontSize: "10px", }} icon={<ExpandOutlined />} onClick={() => setIsFullView(true)} />
      </div>

      {isLoading ? (
        <div
          style={{
            position: "relative",
            minHeight: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin
            size="medium"
            style={{
              position: "absolute",
              zIndex: 1,
            }}
          />
        </div>
      ) : seriesData.length === 0 ? (
        <NoDataFallback />
      ) : (
        <ReactApexChart
          options={chartOptions}
          series={[{ name: "Transit Time", data: seriesData }]}
          type="area"
          height={responsive({ xs: 120, sm: 120, md: 130, lg: 140, xl: 140 })}
        />
      )}

      <FullViewModal isOpen={isFullView} onClose={() => setIsFullView(false)} title={title} theme={theme} />
    </div>
  );
};

const FullViewModal = ({ isOpen, onClose, title, theme }) => {
  const chartColor = theme === "dark" ? "#60a5fa" : "#3b82f6";
  const { responsive: pick, isMobile } = useResponsive();
  const [groupBy, setGroupBy] = useState("Month");
  const [chartType, setChartType] = useState("area");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(12, "month"),
    dayjs(),
  ]);

  const startDate = dateRange[0]?.format("YYYY-MM-DD");
  const endDate = dateRange[1]?.format("YYYY-MM-DD");

  const { data = [], isLoading } = useQuery({
    queryKey: ["full-transit-lead-time-data", groupBy, startDate, endDate],
    queryFn: () => fetchTransitLeadTimeData(groupBy, startDate, endDate),
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  const itemsPerPage =
    groupBy === "Day" ? 7 : groupBy === "Week" ? 3 : groupBy === "Month" ? 12 : 6;

  const paginated = data.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const categories = paginated.map((item) => item.group);
  const seriesData = paginated.map((item) => item.averageTransitTime);

  const chartOptions = {
    theme: { mode: theme },
    chart: { 
      id: "full-view-transit-chart", 
      toolbar: { show: false },
      background: "transparent",
      animations: {
      enabled: true,
      easing: "easeinout",
      speed: 1200,
      animateGradually: {
        enabled: true,
        delay: 200,
      },
    },
    dropShadow: {
        enabled: true,
        // top: 8,
        // right: 20,
        // bottom: 15,
        left: 15,
        blur: 4,
        opacity: 0.7,
      },
  },
    xaxis: { categories },
    yaxis: {
      title: {
        text: "Transit Lead Time (days)",
        style: { fontSize: pick({ xs: "11px", sm: "12px", md: "16px", lg: "18px", xl: "20px" }), fontWeight: 600, color: theme === "dark" ? "#e0e0e0" : "#333" },
      },
    },
    title: {
      text: title,
      style: { fontSize: pick({ xs: "16px", md: "20px", xl: "24px" }), color: theme === "dark" ? "#e0e0e0" : "#333" },
      align: "center",
    },
    // stroke: { curve: "smooth", width: 2, colors: ["#3b82f6"] },
    stroke: {
      curve: chartType === "line" ? "straight" : "smooth",
      width: [6, 5],
      colors: [chartColor],
      lineCap: "round",
    },
    fill: {
      type: chartType === "area" ? "gradient" : "solid",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: chartColor, opacity: 0.4 },
          { offset: 100, color: chartColor, opacity: 0.1 },
        ],
      },
    },
    dataLabels: { enabled: false },
  };

  return (
    <Modal
      title={`Full View - ${title}`}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      style={{ top: 0 }}
      width={pick({ xs: "100%", md: "95vw", lg: "100vw" })}
      height="100vh"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: pick({ xs: "8px", md: "12px", xl: "16px" }),
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <Select
            value={groupBy}
            onChange={(value) => {
              setGroupBy(value);
              setCurrentPage(0);
            }}
            options={[
              { label: "Day", value: "Day" },
              { label: "Week", value: "Week" },
              { label: "Month", value: "Month" },
              { label: "Year", value: "Year" },
            ]}
            style={{ width: pick({ xs: 90, sm: 100, md: 120, lg: 120, xl: 120 }) }}
            size={isMobile ? "small" : "middle"}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates || [dayjs().subtract(12, "month"), dayjs()]);
              setCurrentPage(0);
            }}
            format="DD-MM-YYYY"
            size={isMobile ? "small" : "middle"}
            style={{ maxWidth: isMobile ? 220 : 300 }}
          />
          <Segmented
            value={chartType}
            onChange={(value) => setChartType(value)}
            size={isMobile ? "small" : "middle"}
            options={[
              {
                value: "area",
                icon: <AreaChartOutlined />,
                label: isMobile ? null : "Area",
              },
              {
                value: "line",
                icon: <LineChartOutlined />,
                label: isMobile ? null : "Line",
              },
            ]}
          />
        </div>

        <div>
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            style={{ marginRight: pick({ xs: 4, md: 8 }) }}
            size={isMobile ? "small" : "middle"}
          >
           {isMobile ? "Prev" : "Previous"}
          </Button>
          <Button
            onClick={() =>
              setCurrentPage((prev) =>
                (prev + 1) * itemsPerPage < data.length ? prev + 1 : prev
              )
            }
            disabled={(currentPage + 1) * itemsPerPage >= data.length}
            size={isMobile ? "small" : "middle"}
          >
            Next
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            position: "relative",
            minHeight: pick({ xs: 200, md: 350, xl: 500 }),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin
            size="large"
            style={{
              position: "absolute",
              zIndex: 1,
            }}
          />
        </div>
      ) : seriesData.length === 0 ? (
        <NoDataFallback height={200} />
      ) : (
        <ReactApexChart
          options={chartOptions}
          series={[{ name: "Transit Time", data: seriesData }]}
          type={chartType}
          height={pick({ xs: 280, sm: 320, md: 400, lg: 460, xl: 500 })}
        />
      )}
    </Modal>
  );
};

export default TransitLeadTimeChart;
