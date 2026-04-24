import React, { useState, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCountryWiseVolumeData,
  fetchCountryWiseVolumeFullData,
} from "./fetchCountryWiseVolumeData";
import { Button, Modal, Select, Spin, DatePicker } from "antd";
import { ExpandOutlined } from "@ant-design/icons";
import NoDataFallback from "../../common/NoDataFallback";
import { useOrganizationData } from "../../../hooks/useOrganizationData";
import useStore from "../../../store/UseStore";
import useResponsive from "../../../hooks/useResponsive";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const CountryWiseVolumeChart = () => {
  const { data: orgData } = useOrganizationData();
  const theme = useStore((state) => state.theme);
  const { responsive } = useResponsive();
  const title =
    orgData?.chartTitles?.countryWiseVolume || "Country Wise Volume";

  const [isFullView, setIsFullView] = useState(false);

  // ✅ STATES
  const [groupBy, setGroupBy] = useState("Month");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(12, "month"),
    dayjs(),
  ]);
  const [currentPage, setCurrentPage] = useState(0);

  const startDate = dateRange[0]?.format("YYYY-MM-DD");
  const endDate = dateRange[1]?.format("YYYY-MM-DD");

  // ======================
  // DASHBOARD
  // ======================
  const {
    data: dashboardData = {},
    isLoading: isDashboardLoading,
  } = useQuery({
    queryKey: ["country-wise-volume", "dashboard"],
    queryFn: () => fetchCountryWiseVolumeData("all"),
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const dashboardChartData = dashboardData.data || [];
  const dashboardLabels = dashboardChartData.map((item) => item.country);
  const dashboardSeries = dashboardChartData.map((item) => item.volume);

  const dashboardChartOptions = {
    theme: { mode: theme },
    chart: {
      type: "radialBar",
      background: "transparent",
      dropShadow: {
        enabled: true,
        left: 15,
        blur: 4,
        opacity: 0.7,
      },
    },
    labels: dashboardLabels,
    tooltip: {
      enabled: true,
      y: { formatter: (val) => `${val.toLocaleString()} Tons` },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      radialBar: {
        hollow: { size: "10%" },
        track: {
          background: theme === "dark" ? "#333333" : "#f0f0f0",
          margin: 1,
        },
        dataLabels: { show: false },
      },
    },
  };

  // ======================
  // FULL VIEW
  // ======================
  const {
    data: fullChartData = [],
    isLoading: isFullLoading,
  } = useQuery({
    queryKey: ["country-wise-volume-full", groupBy, startDate, endDate],
    queryFn: () =>
      fetchCountryWiseVolumeFullData(groupBy, startDate, endDate),
    enabled: isFullView,
  });

  console.log("FULL DATA:", fullChartData);

  // ✅ GROUP DATA (MAIN FIX)
  const groupedData = useMemo(() => {
    const map = {};

    fullChartData.forEach((item) => {
      const key = item.group || "Ungrouped";
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });

    return Object.entries(map);
  }, [fullChartData]);

  const totalPages = groupedData.length;

  // ✅ CURRENT GROUP
  const currentGroupData = groupedData[currentPage]?.[1] || [];
  const currentGroupLabel = groupedData[currentPage]?.[0] || "";

  const fullLabels = currentGroupData.map((item) => item.country);
  const fullSeries = currentGroupData.map((item) => item.volume);

  const fullChartOptions = {
    theme: { mode: theme },
    chart: {
      type: "pie",
      background: "transparent",
      dropShadow: {
        enabled: true,
        top: 9,
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
      colors: ["transparent"],
    },
    fill: { opacity: 0.9 },
    title: {
      text: currentGroupLabel
        ? `${title} - ${currentGroupLabel}`
        : title,
      align: "center",
      style: {
        fontSize: "20px",
        color: theme === "dark" ? "#e0e0e0" : "#333",
      },
    },
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1)
      setCurrentPage((prev) => prev + 1);
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
          style={{ height: 18, width: 18, fontSize: "10px" }}
          icon={<ExpandOutlined />}
          onClick={() => {
            setGroupBy("Month");
            setDateRange([dayjs().subtract(12, "month"), dayjs()]);
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
          type="radialBar"
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
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            gap: "10px",
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
            style={{ width: 150 }}
          />

          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(
                dates || [dayjs().subtract(12, "month"), dayjs()]
              );
              setCurrentPage(0);
            }}
          />

          <div>
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              style={{ marginRight: 8 }}
            >
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>

        {/* CONTENT */}
        {isFullLoading ? (
          <div
            style={{
              position: "relative",
              minHeight: 500,
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
              height={responsive({ xs: 300, sm: 350, md: 400, lg: 460, xl: 500 })}
          />
        )}
      </Modal>
    </div>
  );
};

export default CountryWiseVolumeChart;