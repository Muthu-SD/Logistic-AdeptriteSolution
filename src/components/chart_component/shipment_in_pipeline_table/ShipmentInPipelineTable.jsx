import  { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, Spin, Modal, Button } from "antd";
import { ExpandOutlined } from "@ant-design/icons";
import { apiRequest } from "../../../utils/Api";
import useStore from "../../../store/UseStore";
import NoDataFallback from "../../common/NoDataFallback";
import { useOrganizationData } from "../../../hooks/useOrganizationData";
import useResponsive from "../../../hooks/useResponsive";

const fetchInPipelineData = async () => {
  const { user, selectedOrganization } = useStore.getState();
  const isSuperadmin = user?.role === "SUPERADMIN";

  if (isSuperadmin && !selectedOrganization) {
    return [];
  }

  const params = {
    ...(isSuperadmin && { organizationId: selectedOrganization }),
  };

  const response = await apiRequest("GET", "/excel/shipment-in-pipeline-table", null, { params });

  return response;
};

const ShipmentInPipelineTable = () => {
  const { data: orgData } = useOrganizationData();
  const { isMobile, responsive } = useResponsive();
  const title = orgData?.chartTitles?.shipmentInPipeline || "Shipment In Pipeline";
  const [isFullView, setIsFullView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data = [], isLoading } = useQuery({
    queryKey: ["shipment-in-pipeline-table"],
    queryFn: fetchInPipelineData,
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  const columns = [
    {
      title: "BL / HAWB Number",
      dataIndex: "blOrHawbNumber",
      key: "blOrHawbNumber",
    },
    {
      title: "Shipper",
      dataIndex: "shipperDetails",
      key: "shipperDetails",
    },
    {
      title: "ETA",
      dataIndex: "eta",
      key: "eta",
      render: (date) =>
        new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      title: "Material Description",
      dataIndex: "materialDescription",
      key: "materialDescription",
    },
    {
      title: "Origin Country",
      dataIndex: "originCountry",
      key: "originCountry",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
    },
  ];

  // Only show key columns in dashboard view
  const dashboardColumns = isMobile
    ? [
        { ...columns[0], width: 100 }, // BL / HAWB Number
        { ...columns[2], width: 100 }, // ETA
        { ...columns[4], width: 120 }, // Origin Country
      ]
    : [
    { ...columns[0], width: 100 }, // BL / HAWB Number
    { ...columns[1], width: 90 }, // Shipper
    { ...columns[2], width: 100 }, // ETA
    { ...columns[3], width: 180 },  // Material Description
    { ...columns[4], width: 120 }, // Origin Country
    { ...columns[5], width: 170 }, // Remarks
  ];

  // const DASHBOARD_ROWS = 4;

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
        <Button style={{ height: 18, width: 18, fontSize: "10px", }} icon={<ExpandOutlined />} onClick={() => setIsFullView(true)} />
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
      ) : data.length === 0 ? (
        <NoDataFallback />
      ) : (
        <div className="dashboard-table-compact">
          <Table
            columns={dashboardColumns}
            dataSource={data}
            rowKey={(record) => record._id}
            pagination={false}
            scroll={{ y: 85, }}
          />
        </div>
      )}

      <Modal
        title={<div style={{ marginBottom: "12px" }}>{`Full View - ${title}`}</div>}
        open={isFullView}
        onCancel={() => setIsFullView(false)}
        footer={null}
        style={{ top: 0 }}
        width={responsive({ xs: "100%", md: "95vw", lg: "100vw" })}
        // height="100vw"
        destroyOnClose
        centered
      >
        {isLoading ? (
          <div
            style={{
              minHeight: 410,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spin size="large" />
          </div>
        ) : data.length === 0 ? (
          <NoDataFallback height={50} />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey={(record) => record._id}
            pagination={{
              pageSize: 10,
              current: currentPage,
              onChange: setCurrentPage,
              showSizeChanger: false,
            }}
            scroll={{ y: 410, x: "max-content" }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ShipmentInPipelineTable;
