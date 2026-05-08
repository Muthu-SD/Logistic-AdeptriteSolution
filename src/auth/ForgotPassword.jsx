import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import Styles from "../styles/auth/AuthForm.module.css";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../utils/Api";
import logo from "../assets/Logo.png";
import illustrator from "../assets/login/Illustrator.svg";
import useResponsive from "../hooks/useResponsive";

const ForgotPassword = () => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/users/forgot-password", { email },{ auth: false }),
    onSuccess: () => {
      message.success("OTP sent to your email.");
      navigate("/reset-password", { state: { email } }); // Navigate with email
    },
    onError: (error) => alert(error),
  });

  // Manually derive isLoading
  const isLoading = forgotPasswordMutation.status === "loading" || forgotPasswordMutation.status === "pending";

  const handleForgotPassword = () => {
    forgotPasswordMutation.mutate();
  };


  return (
    <div className={Styles.pageWrapper}>
      <div className={Styles.imageFormWrapper}>
        <div className={Styles.imageSection}>
          <img src={logo} alt="Logo" className={Styles.logo} />
          <img
            src={illustrator}
            alt="Illustrator"
            className={Styles.illustrator}
          />
        </div>
        <div className={Styles.formWrapper}>
          <Form
            name="forgotPassword"
            onFinish={handleForgotPassword}
            className={Styles.formContainer}
          >
            {/* Mobile-only logo */}
            {isMobile && (
              <img src={logo} alt="Logo" className={Styles.mobileLogo} />
            )}

            <h2 className={Styles.formTitle}>Forgot Password</h2>
            <p className={Styles.formSubtitle}>
              Enter your email and we&apos;ll send you a verification code
            </p>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
              ]}
            >
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 8 }}>
              <Button
                className={Styles.button_login}
                htmlType="submit"
                loading={isLoading}
              >
                Send OTP
              </Button>
            </Form.Item>
            <div className={Styles.linkWrapper}>
              <Link to="/login" className={Styles.link}>
                Back to Login
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
