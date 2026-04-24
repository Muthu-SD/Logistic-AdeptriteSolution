import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, Spin, Modal, Button } from "antd";
import { ExpandOutlined } from "@ant-design/icons";
import { apiRequest } from "../../../utils/Api";
import useStore from "../../../store/UseStore";
import NoDataFallback from "../../common/NoDataFallback";
import { useOrganizationData } from "../../../hooks/useOrganizationData";
import useResponsive from "../../../hooks/useResponsive";

const fetchOutstandingOverdueData = async () => {
  const { user, selectedOrganization } = useStore.getState();
  const isSuperadmin = user?.role === "SUPERADMIN";

  if (isSuperadmin && !selectedOrganization) {
    return [];
  }

  const params = {
    ...(isSuperadmin && { organizationId: selectedOrganization }),
  };

  const response = await apiRequest("GET", "/excel/outstanding-overdue-table", null, { params });

  return response;
};

const OutstandingOverdueTable = () => {
  const { data: orgData } = useOrganizationData();
  const { isMobile, responsive } = useResponsive();
  const title = orgData?.chartTitles?.outstandingOverdue || "Outstanding Overdue Invoices";
  const [isFullView, setIsFullView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data = [], isLoading } = useQuery({
    queryKey: ["outstanding-overdue-table"],
    queryFn: fetchOutstandingOverdueData,
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  const columns = [
    {
      title: "S.No",
      dataIndex: "sNo",
      key: "sNo",
    },
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Invoice Type",
      dataIndex: "invoiceType",
      key: "invoiceType",
    },
    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (date) => {
        const formattedDate = new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        return formattedDate;
      },
    },
    {
      title: "Overdue Days",
      dataIndex: "overdueDays",
      key: "overdueDays",
    },
  ];

  // Only show key columns in dashboard view
  const dashboardColumns = [
    columns[1], // Invoice Number
    columns[4], // Overdue Days
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
            scroll={{ y: 120, }}
          />
        </div>
      )}

      <Modal
        // title="Full View - Outstanding Overdue Invoices"
        title={<div style={{ marginBottom: "12px" }}>Full View - {title}</div>}
        open={isFullView}
        onCancel={() => setIsFullView(false)}
        footer={null}
        style={{ top: 0 }}
        width={responsive({ xs: "100%", md: "95vw", lg: "100vw" })}
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
          <NoDataFallback height={200} />
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

export default OutstandingOverdueTable;
