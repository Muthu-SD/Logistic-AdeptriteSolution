import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../utils/Api";
import { Form, Input, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Styles from "../styles/auth/AuthForm.module.css";
import logo from "../assets/Logo.png";
import illustrator from "../assets/login/Illustrator.svg";
import useResponsive from "../hooks/useResponsive";

const ResetPassword = () => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm(); // Create a form instance

  const resetPasswordMutation = useMutation({
    mutationFn: (formData) =>
      apiRequest("POST", "/users/reset-password", formData,{ auth: false }),
    onSuccess: () => {
      alert("Password reset successfully. Please login.");
      navigate("/login");
    },
    onError: (error) => alert(error.message),
  });

  // Manually derive isLoading
  const isLoading = resetPasswordMutation.status === "loading" || resetPasswordMutation.status === "pending";
  

  const resendOtpMutation = useMutation({
    mutationFn: () => {
      const email = form.getFieldValue("email"); // Get the email value from the form
      return apiRequest("POST", "/users/forgot-password", { email },{ auth: false });
    },
    onSuccess: () => alert("OTP has been resent to your email."),
    onError: (error) => alert(error.message),
  });

  // Manually derive isLoadingSendOtp
  const isLoadingSendOtp = resendOtpMutation.status === "loading" || resendOtpMutation.status === "pending";

  const handleResetPassword = (values) => {
    resetPasswordMutation.mutate(values);
  };

  const handleResendOtp = () => {
    resendOtpMutation.mutate();
  };

  return (
    <div className={Styles.pageWrapper}>
      <div className={Styles.imageFormWrapper}>
        <div className={Styles.imageSection}>
          <img src={logo} alt="Logo" className={Styles.logo} />
          <img src={illustrator} alt="Illustrator" className={Styles.illustrator} />
        </div>
        <div className={Styles.formWrapper}>
          <Form
            form={form} // Attach the form instance
            name="reset-password"
            onFinish={handleResetPassword}
            className={Styles.formContainer}
            initialValues={{
              email: location.state?.email // Set the initial value for the email field
            }}
          >
            {/* Mobile-only logo */}
            {isMobile && (
              <img src={logo} alt="Logo" className={Styles.mobileLogo} />
            )}

            <h2 className={Styles.formTitle}>Reset Password</h2>
            <p className={Styles.formSubtitle}>
              Create a new password for your account
            </p>

            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                disabled  // Prevent users from modifying the email field
              />
            </Form.Item>

            <Form.Item
              name="resetOtp"
              rules={[{ required: true, message: "Please enter the OTP!" }]}
            >
              <Input
                placeholder="Enter OTP"
              />
            </Form.Item>

            <div className={Styles.resendWrapper}>
              <Button
                type="link"
                className={Styles.resendBtn}
                onClick={handleResendOtp}
                disabled={resendOtpMutation.isLoading}
                loading={isLoadingSendOtp}
              >
                Resend OTP
              </Button>
            </div>

            <Form.Item
              name="newPassword"
              rules={[{ required: true, message: "Please enter your new password!" }]}
            >
              <Input.Password
                placeholder="New Password"
              />
            </Form.Item>

            <Form.Item
              name="confirmNewPassword"
              rules={[{ required: true, message: "Please confirm your new password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("Passwords do not match");
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm New Password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                className={Styles.button_login}
                htmlType="submit"
                loading={isLoading}
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
