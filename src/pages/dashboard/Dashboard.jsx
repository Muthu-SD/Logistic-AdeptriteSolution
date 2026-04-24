import { Col, Row } from "antd";
import InfoCard from "../../components/InfoCard";
import CustomsClearanceLeadTimeChart from "../../components/chart_component/customs_clearance_lead_time_chart/CustomsClearanceLeadTimeChart";
import TransitLeadTimeChart from "../../components/chart_component/transit_lead_time_chart/TransitLeadTimeChart";
import SupplierWiseVolumeChart from "../../components/chart_component/supplier_wise_volume_chart/SupplierWiseVolumeChart";
import CountryWiseVolumeChart from "../../components/chart_component/country_wise_volume_chart/CountryWiseVolumeChart";
import TotalShipmentsHandledChart from "../../components/chart_component/total_shipments_handled_chart/TotalShipmentsHandledChart";
import ShipmentUnderClearanceTable from "../../components/chart_component/shipment_under_clearance_table/ShipmentUnderClearanceTable";
import OutstandingOverdueTable from "../../components/chart_component/outstanding_overdue_table/OutstandingOverdueTable";
import ShipmentInPipelineTable from "../../components/chart_component/shipment_in_pipeline_table/ShipmentInPipelineTable";

const Dashboard = () => {

  return (
    <>
      <div className="dashboard-container">
        <Row gutter={[10, 10]}>

          {/* Clearance lead time  */}
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <InfoCard>
              <CustomsClearanceLeadTimeChart />
            </InfoCard>
          </Col>

          {/* Transit lead time  */}
          <Col xs={24} sm={24} md={12} lg={10} xl={10}>
            <InfoCard>
              <TransitLeadTimeChart />
            </InfoCard>
          </Col>

          {/* Outstanding Overdue Table Data */}
          <Col xs={24} sm={24} md={24} lg={6} xl={6}>
            <InfoCard >
              <OutstandingOverdueTable />
            </InfoCard>
          </Col>

          {/* Main content area */}
          <Col span={24}>
            <Row gutter={[10, 10]}>
              {/* Four cards in one row */}
              <Col xs={24} sm={12} md={12} lg={4} xl={4}>
                <InfoCard>
                  <SupplierWiseVolumeChart />
                </InfoCard>
              </Col>
              <Col xs={24} sm={12} md={12} lg={4} xl={4}>
                <InfoCard>
                  <CountryWiseVolumeChart />
                </InfoCard>
              </Col>
              <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                <InfoCard>
                  <TotalShipmentsHandledChart />
                </InfoCard>
              </Col>
              <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                <InfoCard>
                  <ShipmentUnderClearanceTable />
                </InfoCard>
              </Col>
            </Row>
            <Row gutter={[10, 10]} style={{ marginTop: 10 }}>
              {/* Shipment In Pipeline takes full width */}
              <Col span={24}>
                <InfoCard>
                  <ShipmentInPipelineTable />
                </InfoCard>
              </Col>
            </Row>
          </Col>

        </Row>

      </div>
    </>
  );
};

export default Dashboard;
