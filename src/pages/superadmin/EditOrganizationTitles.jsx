import { Form, Input, Button, message, Modal, Upload, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { apiRequest } from "../../utils/Api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useStore from "../../store/UseStore";
import { useOrganizationData } from "../../hooks/useOrganizationData";
import { useEffect } from "react";
import styles from "../../styles/SuperadminForms.module.css";

const EditOrganizationTitles = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { selectedOrganization, theme } = useStore();
  const { data: orgData, isLoading } = useOrganizationData();
  const [form] = Form.useForm();

  useEffect(() => {
    if (orgData?.chartTitles) {
      form.setFieldsValue(orgData.chartTitles);
    }
  }, [orgData, form]);

  const updateTitlesMutation = useMutation({
    mutationFn: (data) =>
      apiRequest("PUT", `/users/superadmin/organization/${selectedOrganization}/titles`, { chartTitles: data }),
    onSuccess: () => {
      message.success("Dashboard titles updated successfully");
      queryClient.invalidateQueries(); // invalidates everything so dashboard picks up new titles
      onClose();
    },
    onError: (err) => {
      message.error(err?.message || "Failed to update titles");
    },
  });

  const handleLogoUpload = async ({ file }) => {
    const isPng = file.type === "image/png";
    if (!isPng) {
      return message.error("You can only upload PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      return message.error("Image must smaller than 2MB!");
    }

    const formData = new FormData();
    formData.append("logo", file);
    try {
      await apiRequest("POST", `/users/superadmin/organization/${selectedOrganization}/logo`, formData);
      message.success("Logo uploaded successfully");
      queryClient.invalidateQueries();
    } catch (err) {
      message.error("Failed to upload logo: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <Modal
      title={`Edit Chart Titles for ${orgData?.name || "Organization"}`}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      loading={isLoading}
      className={styles.modalOuter}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={updateTitlesMutation.mutate}
        className={styles.modalContent}
      >
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          {orgData?.logoLight && (
            <div style={{ marginBottom: 16 }}>
              <img
                src={orgData.logoLight}
                alt="Current Logo"
                style={{ maxHeight: 60, maxWidth: "100%", objectFit: "contain", filter: theme === "dark" ? "brightness(0) invert(1)" : "none" }}
              />
            </div>
          )}
          <Upload
            name="logo"
            showUploadList={false}
            customRequest={handleLogoUpload}
            accept="image/png"
          >
            <Button icon={<UploadOutlined />}>Upload New Logo </Button>
          </Upload>
          <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
            Only PNG format. Maximum size 2MB. Logo will automatically invert in dark mode.
          </Typography.Text>
        </div>

        <Form.Item label="Customs Clearance Lead Time" name="customsClearanceLeadTime" >
          <Input placeholder="Customs Clearance Lead Time" />
        </Form.Item>
        <Form.Item label="Transit Lead Time" name="transitLeadTime">
          <Input placeholder="Transit Lead Time" />
        </Form.Item>
        <Form.Item label="Supplier Wise Volume" name="supplierWiseVolume">
          <Input placeholder="Supplier Wise Volume" />
        </Form.Item>
        <Form.Item label="Country Wise Volume" name="countryWiseVolume">
          <Input placeholder="Country Wise Volume" />
        </Form.Item>
        <Form.Item label="Total Shipments Handled" name="totalShipmentsHandled">
          <Input placeholder="Total Shipments Handled" />
        </Form.Item>
        <Form.Item label="Shipment Under Clearance" name="shipmentUnderClearance">
          <Input placeholder="Shipment Under Clearance" />
        </Form.Item>
        <Form.Item label="Shipment In Pipeline" name="shipmentInPipeline">
          <Input placeholder="Shipment In Pipeline" />
        </Form.Item>
        <Form.Item label="Outstanding Overdue Invoices" name="outstandingOverdue">
          <Input placeholder="Outstanding Overdue" />
        </Form.Item>

        <div className={styles.formActions}>
          <Button onClick={onClose} style={{ flex: 1, borderRadius: 8 }} size="large">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={updateTitlesMutation.isLoading}
            style={{ flex: 1, borderRadius: 8 }}
            size="large"
          >
            Save Titles
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditOrganizationTitles;
