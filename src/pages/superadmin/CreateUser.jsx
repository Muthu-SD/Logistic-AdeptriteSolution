import { Form, Input, Button, Select, message, Modal } from "antd";
import { useMutation } from "@tanstack/react-query";
import useStore from "../../store/UseStore";
import { apiRequest } from "../../utils/Api";
import styles from "../../styles/SuperadminForms.module.css";

const CreateUser = ({ isOpen, onClose }) => {
  const { selectedOrganization } = useStore();
  const [form] = Form.useForm();

  const role = Form.useWatch("role", form);
  const isAdmin = role === "ADMIN";

  const createUserMutation = useMutation({
    mutationFn: (data) =>
      apiRequest("POST", "/users/superadmin/create-user", data),
    onSuccess: () => {
       message.success(isAdmin ? "Admin created successfully" : "User created successfully");
      form.resetFields();
      onClose();
    },
    onError: (err) => {
      message.error(err?.message || `Failed to create ${isAdmin ? "admin" : "user"}`);
    },
  });

  const onFinish = (values) => {
    if (!selectedOrganization) {
      message.warning("Please select an organization first");
      return;
    }

    createUserMutation.mutate({
      name: values.name,
      email: values.email,
      role: values.role,
      password: values.password,
      confirmPassword: values.confirmPassword,
      organizationId: selectedOrganization,
    });
  };

  return (
    <Modal
      title={isAdmin ? "Create Admin" : "Create User"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      className={styles.modalOuter}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className={styles.modalContent}>
          {/* Name */}
          <Form.Item
            label={isAdmin ? "Admin Name" : "User Name"}
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder={isAdmin ? "Admin full name" : "User full name"} />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder={isAdmin ? "admin@email.com" : "user@email.com"} />
          </Form.Item>

          {/* Role */}
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Admin", value: "ADMIN" },
                { label: "User", value: "USER" },
              ]}
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Passwords do not match")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>

          <div className={styles.formActions}>
            <Button onClick={onClose} style={{ flex: 1, borderRadius: 8 }} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createUserMutation.isLoading}
              style={{ flex: 1, borderRadius: 8 }}
              size="large"
            >
              {isAdmin ? "Create Admin" : "Create User"}
            </Button>
          </div>
      </Form>
    </Modal>
  );
};

export default CreateUser;