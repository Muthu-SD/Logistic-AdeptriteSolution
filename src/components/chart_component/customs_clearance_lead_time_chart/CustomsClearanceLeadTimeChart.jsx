import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomsClearanceLeadTimeData } from "./fetchCustomsClearanceLeadTimeData";
import { Select, Button, Modal, Spin, DatePicker } from "antd";
import { ExpandOutlined } from "@ant-design/icons";
import NoDataFallback from "../../common/NoDataFallback";
import { useOrganizationData } from "../../../hooks/useOrganizationData";
import useStore from "../../../store/UseStore";
import useResponsive from "../../../hooks/useResponsive";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const CustomsClearanceLeadTimeChart = () => {
  const { data: orgData } = useOrganizationData();
  const theme = useStore((state) => state.theme);
  const { responsive } = useResponsive();
  const title = orgData?.chartTitles?.customsClearanceLeadTime || "Customs Clearance Lead Time";
  const [isFullView, setIsFullView] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["current-shipment-data", "Month"], // Default groupBy for dashboard view
    queryFn: () => fetchCustomsClearanceLeadTimeData("Month"),
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
  
  const chartData = (data || []).slice(0, 5); // Dashboard shows 4 months max
  const categories = chartData.map((item) => item.group.split(" ")[0]);
  const seriesData = chartData.map((item) => item.averageLeadTime);

  const chartOptions = {
    theme: { mode: theme },
    chart: {
      id: "clearance-lead-time",
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
      toolbar: { show: false },
      dropShadow: {
        enabled: true,
        left: 5,
        blur: 0.3,
        opacity: 0.4,
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
        text: "Clearance Lead Time (days)",
        style: { fontSize: "10px", fontWeight: 600, color: theme === "dark" ? "#e0e0e0" : "#333" },
      },
    },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.15,
        },
      },
    },
    colors: [
      function ({ value }) {
        if (value <= 5) return theme === "dark" ? "#5cd682" : "#44AF69";
        if (value <= 7) return theme === "dark" ? "#ffc44d" : "#Fcab10";
        return theme === "dark" ? "#ff666d" : "#f8333c";
      },
    ],
    dataLabels: { enabled: false, style: { fontSize: "12px" } },
    stroke: {
      show: true,
      width: 2,
      colors: [
        function ({ value }) {  
          if (value <= 5) return theme === "dark" ? "#44af69" : "#2E8B57";      
          if (value <= 7) return theme === "dark" ? "#fcab10" : "#D48F00";    
          return theme === "dark" ? "#f8333c" : "#CC2936";                    
        },
      ],
    },
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
         <h6 className="dashboard-chart-heading">{title}</h6>
        <Button
        style={{ height: 18,width: 18, fontSize: "10px",}}
          icon={<ExpandOutlined />}
          onClick={() => setIsFullView(true)}
        />
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
        <NoDataFallback  />
      ) : (
        <ReactApexChart
          options={chartOptions}
          series={[{ name: "Lead Time", data: seriesData }]}
          type="bar"
          height={responsive({ xs: 120, sm: 120, md: 130, lg: 140, xl: 140 })}
        />
      )}

      {/* Full View Modal with Select & Pagination */}
      <FullViewModal
        isOpen={isFullView}
        onClose={() => setIsFullView(false)}
        title={title}
        theme={theme}
      />
    </div>
  );
};

const FullViewModal = ({ isOpen, onClose, title, theme }) => {
  const { responsive: pick, isMobile } = useResponsive();
  const [groupBy, setGroupBy] = useState("Month");
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(12, "month"),
    dayjs(),
  ]);

  const startDate = dateRange[0]?.format("YYYY-MM-DD");
  const endDate = dateRange[1]?.format("YYYY-MM-DD");

  const { data = [], isLoading } = useQuery({
    queryKey: ["full-clearance-data", groupBy, startDate, endDate],
    queryFn: () => fetchCustomsClearanceLeadTimeData(groupBy, startDate, endDate),
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
  const seriesData = paginated.map((item) => item.averageLeadTime);

  const chartOptions = {
    theme: { mode: theme },
    chart: { 
      id: "full-view-chart", 
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
        top: 5,
        left: 5,
        blur: 0.3,
        opacity: 0.4,
      },
    },
    xaxis: { categories },
    yaxis: {
      title: {
        text: "Clearance Lead Time (days)",
        style: { fontSize: pick({ xs: "11px", sm: "12px", md: "16px", lg: "18px", xl: "20px" }), fontWeight: 600, color: theme === "dark" ? "#e0e0e0" : "#333" },
      },
    },
    title: { text: title, style: { fontSize: pick({ xs: "16px", md: "20px", xl: "24px" }), color: theme === "dark" ? "#e0e0e0" : "#333" }, align: "center" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
        states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.15,
        },
      },
    },
    colors: [
    function ({ value }) {
      if (value <= 5) return theme === "dark" ? "#5cd682" : "#44AF69";
      if (value <= 7) return theme === "dark" ? "#ffc44d" : "#Fcab10";
      return theme === "dark" ? "#ff666d" : "#f8333c";
    },
  ],
    dataLabels: { enabled: !isMobile, style: { fontSize: pick({ xs: "9px", md: "11px", xl: "12px" }), colors: [theme === "dark" ? "#e0e0e0" : "#313030"] } },
    stroke: {
      show: true,
      width: 2,
      colors: [
        function ({ value }) { 
          if (value <= 5) return theme === "dark" ? "#44af69" : "#2E8B57";     
          if (value <= 7) return theme === "dark" ? "#fcab10" : "#D48F00";    
          return theme === "dark" ? "#f8333c" : "#CC2936";                     
        },
      ],
    },
    // annotations: {
    //   points: paginated
    //     .map((item, i) =>
    //       item.averageLeadTime === 0
    //         ? {
    //           x: item.group, // X-axis category
    //           y: 0,         // Y-axis 0 (bottom)
    //           marker: { size: 0 },
    //           label: {
    //             text: "0",
    //             style: { color: "#000", fontSize: "12px", fontWeight: 600 },
    //             offsetY: -10, // moves label above X-axis
    //             orientation: "horizontal",
    //           },
    //         }
    //         : null
    //     )
    //     .filter(Boolean),
    // },
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
        <div>
        <ReactApexChart
          options={chartOptions}
          series={[{ name: "Lead Time", data: seriesData }]}
            type="bar"
            height={pick({ xs: 280, sm: 320, md: 380, lg: 430, xl: 460 })}
          />
          <div style={{ marginTop: pick({ xs: 8, md: 14, xl: 20 }), fontSize: pick({ xs: 11, md: 13, xl: 14 }) }}>
            <div style={{ display: "flex", justifyContent: "center", gap: pick({ xs: "8px", md: "12px", xl: "16px" }), flexWrap: "wrap", marginTop: pick({ xs: 4, md: 6, xl: 8 }) }}>
              <div><span style={{ backgroundColor: theme === "dark" ? "#5cd682" : "#44AF69", width: 12, height: 12, display: "inline-block", marginRight: 6 }} /> 0 to 5 days</div>
              <div><span style={{ backgroundColor: theme === "dark" ? "#ffc44d" : "#Fcab10", width: 12, height: 12, display: "inline-block", marginRight: 6 }} /> 5.1 to 7 days</div>
              <div><span style={{ backgroundColor: theme === "dark" ? "#ff666d" : "#f8333c", width: 12, height: 12, display: "inline-block", marginRight: 6 }} /> 7.0+ days</div>
            </div>
          </div>
        </div>

      )}
    </Modal>
  );
};

export default CustomsClearanceLeadTimeChart;
