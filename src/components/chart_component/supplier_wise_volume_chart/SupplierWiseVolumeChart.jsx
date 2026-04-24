import React, { useState, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "@tanstack/react-query";
import {fetchSupplierWiseVolumeData, fetchSupplierWiseVolumeFullData } from "./fetchSupplierVolumeData";
import { Button, Modal, Select, Spin, DatePicker } from "antd";
import { ExpandOutlined } from "@ant-design/icons";
import NoDataFallback from "../../common/NoDataFallback";
import { useOrganizationData } from "../../../hooks/useOrganizationData";
import useStore from "../../../store/UseStore";
import useResponsive from "../../../hooks/useResponsive";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const SupplierWiseVolumeChart = () => {
  const { data: orgData } = useOrganizationData();
  const theme = useStore((state) => state.theme);
  const { responsive, isMobile } = useResponsive();
  const title = orgData?.chartTitles?.supplierWiseVolume || "Supplier Wise Volume";
  const [isFullView, setIsFullView] = useState(false);

  // ✅ NEW STATES
  const [groupBy, setGroupBy] = useState("Month");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(12, "month"),
    dayjs(),
  ]);
  const [currentPage, setCurrentPage] = useState(0);

  const startDate = dateRange[0]?.format("YYYY-MM-DD");
  const endDate = dateRange[1]?.format("YYYY-MM-DD");



  // Dashboard view (always uses month = 'all')
  const {
    data: dashboardData = {},
    isLoading: isDashboardLoading,
  } = useQuery({
      queryKey: ["supplier-wise-volume", "dashboard"],
      queryFn: () => fetchSupplierWiseVolumeData("all"),
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetching on window focus
    });

  // Only Top 5 suppliers for dashboard view
  const dashboardChartData = (dashboardData.data || [])
    .sort((a, b) => b.volume - a.volume) // Sort descending by volume
    .slice(0, 5); // Only top 5

  const dashboardLabels = dashboardChartData.map((item) => item.supplier);
  const dashboardSeries = dashboardChartData.map((item) => item.volume);

  const dashboardChartOptions = {
    theme: { mode: theme },
    chart: {
      type: "polarArea",
      background: "transparent",
          dropShadow: {
        enabled: true,
        left: 10,
        blur: 4,
        opacity: 0.7,
      },
    },
    legend: {
      show: false,
    },
    labels: dashboardLabels,
    dataLabels: {
      enabled: false, 
    },
tooltip: {
      y: {
        formatter: (value) => `${value.toLocaleString()} Tons`,
      },
    },
stroke: {
    width: 2,
    // colors: ["transparent"], // Hide lines between segments
  },
  fill: {
    opacity: 0.9,
  },
 yaxis: {
    show: false, // Hide radial axis lines and marks
  },
  xaxis: {
    show: false, // Hide angular axis lines and marks
  },
 plotOptions: {
    polarArea: {
      rings: {
        strokeWidth: 0, // Remove circular grid lines
      },
      spokes: {
        strokeWidth: 0, // Remove lines from center to edges
      },
    },
  },
};

  // ======================
  // FULL VIEW 
  // ======================
  const { data: fullData = [], isLoading: isFullLoading } = useQuery({
    queryKey: [
      "supplier-wise-volume-full",
      groupBy,
      startDate,
      endDate,
    ],
    queryFn: () =>
      fetchSupplierWiseVolumeFullData(groupBy, startDate, endDate),
    enabled: isFullView, // only fetch when modal is open
  });

  // ✅ Group by time (Month / Day / Week / Year)
const groupedData = useMemo(() => {
  const map = {};

  fullData.forEach((item) => {
    const key = item.group || "Unknown";
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });

  return Object.entries(map); // [ [group, data[]], ... ]
}, [fullData]);

const totalPages = groupedData.length;

// current group
const currentGroupData = groupedData[currentPage]?.[1] || [];
const currentGroupLabel = groupedData[currentPage]?.[0] || "";

// chart data
const fullLabels = currentGroupData.map((item) => item.supplier);
const fullSeries = currentGroupData.map((item) => item.volume);

  const fullChartOptions = {
    theme: { mode: theme },
    chart: {
      type: "pie",
      background: "transparent",
      dropShadow: {
        enabled: true,
        top:9,
        left: 15,
        blur: 4,
        opacity: 0.7,
      },
    },
    labels: fullLabels,
    tooltip: {
      y: { formatter: (val) => `${val.toLocaleString()} Tons` },
    },
    stroke: {
      width: 1,
      colors: ["transparent"], // Hide lines between segments
    },
    fill: {
      opacity: 0.9,
    },
    title: {
      text: currentGroupLabel
  ? `${title} - ${currentGroupLabel}`
  : title,
      align: "center",
      style: {
        fontSize: "24px",
        color: theme === "dark" ? "#e0e0e0" : "#333",
      },
    },
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1)
      setCurrentPage((p) => p + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 0)
      setCurrentPage((p) => p - 1);
  };

  return (
    <div>
      {/* HEADER */}
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
          onClick={() => {
            setGroupBy("Month");
            setDateRange([
              dayjs().subtract(12, "month"),
              dayjs(),
            ]);
            setCurrentPage(0);
            setIsFullView(true);
          }}
        />
      </div>

      {/* DASHBOARD */}
      {isDashboardLoading ? (
        <div
          style={{
            position: "relative",
            minHeight: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="medium" />
        </div>
      ) : dashboardSeries.length === 0 ? (
        <NoDataFallback />
      ) : (
        <ReactApexChart
          options={dashboardChartOptions}
          series={dashboardSeries}
          type="polarArea"
          height={responsive({ xs: 150, sm: 150, md: 150, lg: 150, xl: 150 })}
        />
      )}

      {/* FULL VIEW */}
      <Modal
        title={`Full View - ${title}`}
        open={isFullView}
        onCancel={() => setIsFullView(false)}
        footer={null}
        style={{ top: 0 }}
        width={responsive({ xs: "100%", md: "95vw", lg: "100vw" })}
        height="100vh"
        destroyOnClose
      >
        {/* FILTERS */}
        <div
          style={{
            display: "flex",
            gap: 10,
             marginBottom: responsive({ xs: "8px", md: "12px", xl: "16px" }),
            flexWrap: "wrap",
          }}
        >
          <Select
            value={groupBy}
            onChange={(val) => {
              setGroupBy(val);
              setCurrentPage(0);
            }}
            options={[
              { label: "Day", value: "Day" },
              { label: "Week", value: "Week" },
              { label: "Month", value: "Month" },
              { label: "Year", value: "Year" },
            ]}
            style={{ width: responsive({ xs: 100, sm: 120, md: 150, lg: 150, xl: 150 }) }}
            size={isMobile ? "small" : "middle"}
          />

          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(
                dates || [
                  dayjs().subtract(12, "month"),
                  dayjs(),
                ]
              );
              setCurrentPage(0);
            }}
          />

          <Button 
          onClick={handlePrevious} 
          disabled={currentPage === 0}
          style={{ marginRight: responsive({ xs: "4px", md: "8px" }) }}
          size={isMobile ? "small" : "middle"}
          >
           {isMobile ? "Prev" : "Previous"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            size={isMobile ? "small" : "middle"}
          >
            Next
          </Button>
        </div>

        {/* CHART */}
        {isFullLoading ? (
          <div
            style={{
              position: "relative",
              minHeight: responsive({ xs: 200, md: 350, xl: 500 }),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spin size="large" />
          </div>
        ) : fullSeries.length === 0 ? (
          <NoDataFallback height={200} />
        ) : (
          <ReactApexChart
            options={fullChartOptions}
            series={fullSeries}
            type="pie"
            height={responsive({ xs: 400, sm: 400, md: 400, lg: 500, xl: 500 })}
          />
        )}
      </Modal>
    </div>
  );
};

export default SupplierWiseVolumeChart;