import { Form, Input, Button, message, Modal, Upload, Typography  } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { apiRequest } from "../../utils/Api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useStore from "../../store/UseStore";
import styles from "../../styles/SuperadminForms.module.css";

const CreateOrganization = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { setSelectedOrganization } = useStore();
   const [form] = Form.useForm();
   const [logoFile, setLogoFile] = useState(null);

  const createOrgMutation = useMutation({
    mutationFn: (data) =>
      apiRequest("POST", "/users/superadmin/organization", data),
    onSuccess: async (org) => {
      message.success("Organization created successfully");

       if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        try {
          await apiRequest("POST", `/users/superadmin/organization/${org._id}/logo`, formData);
          message.success("Logo uploaded successfully");
        } catch (err) {
          message.error("Failed to upload logo: " + (err?.message || "Unknown error"));
        }
      } 

      // Auto select newly created org
      setSelectedOrganization(org._id);

      // Refresh org list + dashboard
      queryClient.invalidateQueries(["organizations"]);
      queryClient.invalidateQueries();

      setLogoFile(null);
      form.resetFields();
      onClose();
    },
    onError: (err) => {
      message.error(err || "Failed to create organization");
    },
  });

  const handleRemoveLogo = () => {
    setLogoFile(null);
  };

  const beforeUpload = (file) => {
    const isPng = file.type === "image/png";
    if (!isPng) {
      message.error("You can only upload PNG file!");
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }
    setLogoFile(file);
    return false; // Prevent auto-upload
  };

  const handleClose = () => {
    form.resetFields();
    setLogoFile(null);
    onClose();
  };

  return (
  <Modal
      title="Create Organization"
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      destroyOnClose
      centered
      className={styles.modalOuter}
    >
        <Form
         form={form}
          layout="vertical"
          onFinish={createOrgMutation.mutate}
          className={styles.modalContent}
        >
          <Form.Item
            label="Organization Name"
            name="name"
            rules={[{ required: true, message: "Organization name is required" }]}
          >
             <Input placeholder="e.g. Logistics_3" className={styles.modernInput} />
          </Form.Item>

<Form.Item label="Organization Logo (Optional)">
            <Upload
              name="logo"
              listType="picture"
              maxCount={1}
              beforeUpload={beforeUpload}
              onRemove={handleRemoveLogo}
              accept="image/png"
            >
              <Button icon={<UploadOutlined />}>Select PNG Logo</Button>
            </Upload>
            <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
              Only PNG format. Maximum size 2MB. Logo will display on transparent/dark backgrounds.
            </Typography.Text>
          </Form.Item>

<div className={styles.formActions}>
            <Button onClick={handleClose} style={{ flex: 1, borderRadius: 8 }} size="large">
              Cancel
            </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createOrgMutation.isLoading}
            style={{ flex: 1, borderRadius: 8 }}
              size="large"
          >
            Create
          </Button>
    </div>
        </Form>
      </Modal>
  );
};

export default CreateOrganization;