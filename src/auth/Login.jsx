import { useState,useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../utils/Api";
import useStore from "../store/UseStore";
import { Form, Input, Button, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import Styles from "../styles/auth/AuthForm.module.css";
import logo from "../assets/Logo.png"; 
import illustrator from "../assets/login/Illustrator.svg";
import Turnstile from "react-turnstile";
import useResponsive from "../hooks/useResponsive"; 

const Login = () => {
  const { isMobile } = useResponsive();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState(null);
  const { setAuth, theme } = useStore(); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("message") === "session_expired") {
      message.warning("You have been logged out because your account was accessed from another device", 5);
      // Clean up the URL
      window.history.replaceState({}, document.title, "/login");
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: (data) => apiRequest("POST", "/users/login", data,{ auth: false }),
    onSuccess: (data) => {
      message.success("Login successfull!");
      // Save auth
      setAuth({
        user: data.user,
        token: data.token,
      });
     // Redirect based on role
      if (data.user.role === "SUPERADMIN") {
        navigate("/superadmin");
      } else {
        navigate("/");
      }
    },
    onError: (error) => {
      const messageText = error?.toString();
      if ( messageText?.toLowerCase().includes("verify")) {
        // Save email to localStorage to use in OTP verification
        localStorage.setItem("verifyEmail", email);
        message.warning("Please verify your email.");
        navigate("/verify-otp");
      }else {
        message.error(error?.message || "Login failed. Please try again.");
      }
    },
  });

  // Manually derive isLoading
  const isLoading = loginMutation.status === "loading" || loginMutation.status === "pending";

  const handleLogin = () => {
     if (!turnstileToken) {
      message.error("Please complete the verification.");
      return;
    }
    loginMutation.mutate({ email, password, token: turnstileToken });
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
            name="login"
            onFinish={handleLogin}
            className={Styles.formContainer}
          >
            {/* Mobile-only logo */}
            {isMobile && (
              <img src={logo} alt="Logo" className={Styles.mobileLogo} />
            )}

            <h2 className={Styles.formTitle}>Welcome Back</h2>
            <p className={Styles.formSubtitle}>
              Sign in to your account to continue
            </p>

            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input
                type="email"
                placeholder="Email address"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                autoComplete="username" 
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item className={Styles.turnstileWrapper}
            >
              <Turnstile
                sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onVerify={(token) => {
                  setTurnstileToken(token);
                }}
                onError={(err) => {
                  console.error("Turnstile Error Details:", err);
                  message.error("CAPTCHA error. Please try again.");
                }}
                size="normal"
                theme={theme === "dark" ? "dark" : "light"}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 8 }}>
              <Button
                className={Styles.button_login}
                htmlType="submit"
                disabled={loginMutation.isLoading}
                loading={isLoading}  // Show loading spinner
              >
                Sign In
              </Button>
            </Form.Item>
            <div className={Styles.linkWrapper}>
              <Link to="/forgot-password" className={Styles.link}>
                Forgot Password?
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
