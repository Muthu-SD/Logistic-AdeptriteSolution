import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import Styles from "../styles/auth/AuthForm.module.css";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../utils/Api";
import logo from "../assets/Logo.png"; // Import logo
import illustrator from "../assets/login/Illustrator.svg"; // Import illustration

const ForgotPassword = () => {
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

  // Log the derived isLoading value
  // useEffect(() => {
  //   console.log("Derived isLoading:", isLoading);
  // }, [forgotPasswordMutation.status]);

  const handleForgotPassword = () => {
    forgotPasswordMutation.mutate();
  };


  return (
    <div className={Styles.pageWrapper}>
      <div className={Styles.imageFormWrapper}>
        <div className={Styles.imageSection}>
          <center>
            {/*--- to make logo image center this center tag is used ---*/}
            <img src={logo} alt="Logo" className={Styles.logo} />
          </center>
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
            <h2 className={Styles.formTitle}>
              Forgot Password
            </h2>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
              ]}
            >
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item style={{ textAlign: "center" }}>
              <Button
                className={Styles.button_login}
                htmlType="submit"
                // disabled={isLoading}
                loading={isLoading}
              >
                Send OTP
              </Button>
            </Form.Item>
            <p style={{ textAlign: "center" ,
              marginTop: "66px"
              }}>
              <Link to="/login" className={Styles.link}>
                Back to Login
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
