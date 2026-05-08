import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../utils/Api";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import Styles from "../styles/auth/AuthForm.module.css";
import logo from "../assets/Logo.png";
import illustrator from "../assets/login/Illustrator.svg";
import useResponsive from "../hooks/useResponsive";

const OtpVerification = () => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("verifyEmail");
    if (!storedEmail) {
      message.warning("Session expired. Please sign up again.");
      navigate("/login");
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const otpVerifyMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/users/verify-otp", { email, otp },{ auth: false }),
    onSuccess: () => {
      localStorage.removeItem("verifyEmail");
      message.success("OTP verified successfully!");
      navigate("/login");
    },
    onError: (error) => {
      message.error(error || "OTP verification failed!");
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/users/resend-otp", { email },{ auth: false }),
    onSuccess: () => {
      message.success("OTP resent successfully!");
    },
    onError: (error) => {
      message.error(error || "Failed to resend OTP");  
    },
  });

  return (
    <div className={Styles.pageWrapper}>
      <div className={Styles.imageFormWrapper}>
        <div className={Styles.imageSection}>
          <img src={logo} alt="Logo" className={Styles.logo} />
          <img src={illustrator} alt="Illustrator" className={Styles.illustrator} />
        </div>
        <div className={Styles.formWrapper}>
          <Form
            name="otpVerification"
            onFinish={otpVerifyMutation.mutate}
            className={Styles.formContainer}
          >
            {/* Mobile-only logo */}
            {isMobile && (
              <img src={logo} alt="Logo" className={Styles.mobileLogo} />
            )}

            <h2 className={Styles.formTitle}>Verify OTP</h2>
            <p className={Styles.formSubtitle}>
              Enter the verification code sent to your email
            </p>

            <Form.Item
              name="otp"
              rules={[{ required: true, message: "Please enter the OTP!" }]}
            >
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </Form.Item>

            <div className={Styles.resendWrapper}>
              <Button
                type="link"
                className={Styles.resendBtn}
                onClick={() => resendOtpMutation.mutate()}
                disabled={resendOtpMutation.isLoading}
              >
                Resend OTP
              </Button>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                className={Styles.button_login}
                htmlType="submit"
                disabled={otpVerifyMutation.isLoading}
              >
                Verify OTP
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
