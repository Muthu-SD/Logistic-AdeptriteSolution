import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../utils/Api";
import { Form, Input, Button, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import Styles from "../styles/auth/AuthForm.module.css";
import logo from "../assets/Logo.png";
import illustrator from "../assets/login/Illustrator.svg";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("User");

  const navigate = useNavigate();

  const signUpMutation = useMutation({
    mutationFn: (data) => apiRequest("POST", "/users/register", data),
    onSuccess: () => {
      localStorage.setItem("verifyEmail", email); // Save email
      message.success("OTP sent to your email");
      navigate("/verify-otp");
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Registration failed!");
    },
  });

// Manually derive isLoading
const isLoading = signUpMutation.status === "loading" || signUpMutation.status === "pending";

  const handleRegister = () => {
    signUpMutation.mutate({ role, name, email, password, confirmPassword });
  };

  return (
    <div className={Styles.pageWrapper}>
      <div className={Styles.imageFormWrapper}>
        <div className={Styles.imageSection}>
          <center>
            <img src={logo} alt="Logo" className={Styles.logo} />
          </center>
          <img src={illustrator} alt="Illustrator" className={Styles.illustrator} />
        </div>
        <div className={Styles.formWrapper}>
          <Form
            name="signup"
            onFinish={handleRegister}
            className={Styles.formContainer}
          >
            <h2 className={Styles.formTitle}>Sign Up</h2>

            <Form.Item name="name" rules={[{ required: true, message: "Please input your name!" }]}>
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Item>

            <Form.Item name="email" rules={[{ required: true, message: "Please input your email!" }]}>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
              <Input.Password
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item name="confirmPassword" rules={[{ required: true, message: "Please confirm your password!" }]}>
              <Input.Password
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginTop: "32px" }}>
              <Button
                className={Styles.button_login}
                htmlType="submit"
                disabled={signUpMutation.isLoading}
                loading={isLoading} // Show loading spinner
              >
                Signup
              </Button>
            </Form.Item>

            <p style={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link to="/login" className={Styles.link}>
                Login
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
