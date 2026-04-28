import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "@tanstack/react-query";
import { Select, Button, Modal, Spin, DatePicker } from "antd";
import { ExpandOutlined } from "@ant-design/icons";
import { fetchTotalShipmentsHandledData, fetchTotalShipmentsHandledFullData } from "./fetchTotalShipmentsHandledData";
import NoDataFallback from "../../common/NoDataFallback";
import { useOrganizationData } from "../../../hooks/useOrganizationData";
import useStore from "../../../store/UseStore";
import useResponsive from "../../../hooks/useResponsive";
import dayjs from "dayjs";

const DASHBOARD_ITEMS_LIMIT = 5;
const { RangePicker } = DatePicker;

const TotalShipmentsHandledChart = () => {
  const { data: orgData } = useOrganizationData();
  const theme = useStore((state) => state.theme);
  const { responsive } = useResponsive();
  const title = orgData?.chartTitles?.totalShipmentsHandled || "Total Shipments Handled";
  const [isFullView, setIsFullView] = useState(false);
  const [groupBy, setGroupBy] = useState("Month");
  const [dateRange, setDateRange] = useState([dayjs().subtract(12, "month"), dayjs()]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage =
    groupBy === "Day" ? 7 : groupBy === "Week" ? 3 : groupBy === "Month" ? 12 : 6;
  const startDate = dateRange[0]?.format("YYYY-MM-DD");
  const endDate = dateRange[1]?.format("YYYY-MM-DD");

  const { data = {}, isLoading } = useQuery({
    queryKey: ["total-shipments-handled", "all"],
    queryFn: () => fetchTotalShipmentsHandledData("all"),
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  const { data: modalChartData = [], isLoading: isLoadingModal } = useQuery({
    queryKey: ["total-shipments-handled-modal", groupBy, startDate, endDate],
    queryFn: () => fetchTotalShipmentsHandledFullData(groupBy, startDate, endDate),
    enabled: isFullView,
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  const chartData = data.data || [];
  const dashboardData = chartData.slice(0, DASHBOARD_ITEMS_LIMIT);
  const fullviewData = modalChartData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Add a utility function to shorten the names
  const shortenName = (name, maxLength = 7) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };


  const getDashboardChartOptions = (categories) => ({
    theme: { mode: theme },
    chart: {
      type: "bar",
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
        // top: 1,
        // right: 10,
        // bottom: 10,
        left: 5,
        blur: 0.3,
        opacity: 0.4,
      },
      toolbar: { show: false },
    },
     plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '45%', 
      }
    },
    dataLabels: {
      enabled: false, // Hides data labels on bars
    },
    stroke: {
      show: true,
      width: 2,
      colors: [theme === "dark" ? "#3ca8ff" : "#0070C8"],
    },
    xaxis: {
      categories: categories.map((name) => shortenName(name)), // Shorten the names here
      labels: {
        style: { fontSize: "9px" },
        rotate: 0,
      },
    },
    yaxis: {
      title: {
        text: "Total Shipments",
        style: {
          fontSize: "10px",
          fontWeight: 600,
          color: theme === "dark" ? "#e0e0e0" : "#333",
        },
      },
    },
    colors: [theme === "dark" ? "#60a5fa" : "#3b82f6"],
    tooltip: {
      y: { formatter: (value) => `${value}` },
    },
  });
  const getFullViewChartOptions = (categories) => ({
    theme: { mode: theme },
    chart: {
      type: "bar",
      background: "transparent",
        animations: {
    enabled: true,           // Enable/disable animation
    easing: "easeinout",        // Animation type: "linear", "easein", "easeout", "easeinout", "easeinback", "easeoutback", "easeinbounce", "easeoutbounce"
    speed: 1200,             // Duration in ms
    animateGradually: {
      enabled: true,
      delay: 200,            // Delay between each bar animation
    },
  },
  dropShadow: {
        enabled: true,
        top: 5,
        // right: 10,
        // bottom: 10,
        left: 5,
        blur: 0.3,
        opacity: 0.4,
      },
  toolbar: { show: false },
},
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "10px",
          fontWeight: 600,
        },
        rotate: 0, // to make labels in straight
      },
    },
    yaxis: {
      title: {
        text: "Total Shipments",
        style: {
          fontSize: "20px",
          fontWeight: 600,
          color: theme === "dark" ? "#e0e0e0" : "#333",
        },
      },
    },
    colors: [theme === "dark" ? "#60a5fa" : "#3b82f6"],
    tooltip: {
      y: { formatter: (value) => `${value}` },
    },
    title: {
      text: title,
      align: "center",
      style: { fontSize: responsive({ xs: "16px", md: "20px", xl: "24px" }), color: theme === "dark" ? "#e0e0e0" : "#333" },
    },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    stroke: {
      show: true,
      width: 2,
      colors: [theme === "dark" ? "#3ca8ff" : "#0070C8"],
    },
  });

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
          style={{ height: 18, width: 18, fontSize: "10px", }}
          icon={<ExpandOutlined />}
          onClick={() => {
            setGroupBy("Month");
            setDateRange([dayjs().subtract(12, "month"), dayjs()]);
            setCurrentPage(0);
            setIsFullView(true);
          }}
        />
      </div>

      {isLoading ? (
        <div
          style={{
            minHeight: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="medium" />
        </div>
      ) : dashboardData.length === 0 ? (
        <NoDataFallback />
      ) : (
        <ReactApexChart
          options={getDashboardChartOptions(
            dashboardData.map((item) => item.shipper)
          )}
          series={[
            {
              name: "Shipments",
              data: dashboardData.map((item) => item.count),
            },
          ]}
          type="bar"
          height={responsive({ xs: 120, sm: 120, md: 130, lg: 140, xl: 140 })}
        />
      )}

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
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
            style={{ width: 150 }}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates || [dayjs().subtract(12, "month"), dayjs()]);
              setCurrentPage(0);
            }}
            format="DD-MM-YYYY"
            style={{ maxWidth: 300 }}
          />
          <div>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              style={{ marginRight: 8 }}
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setCurrentPage((prev) =>
                  (prev + 1) * itemsPerPage < modalChartData.length ? prev + 1 : prev
                )
              }
              disabled={(currentPage + 1) * itemsPerPage >= modalChartData.length}
            >
              Next
            </Button>
          </div>
        </div>
        {isLoadingModal ? (
          <div
            style={{
              minHeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spin size="large" />
          </div>
        ) : modalChartData.length === 0 ? (
          <NoDataFallback height={200} />
        ) : (
          <ReactApexChart
            options={getFullViewChartOptions(
              fullviewData.map((item) => item.group)
            )}
            series={[
              {
                name: "Shipments",
                data: fullviewData.map((item) => item.count),
              },
            ]}
            type="bar"
            height={responsive({ xs: 280, sm: 320, md: 380, lg: 440, xl: 470 })}
          />
        )}
      </Modal>
    </div>
  );
};

export default TotalShipmentsHandledChart;
