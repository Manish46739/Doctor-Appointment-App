import React, { useState } from "react";
import "../styles/RegisterStyles.css";
import { Form, Input, message, Checkbox } from "antd";
import { 
  MailOutlined, 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLoginButton, FacebookLoginButton } from "react-social-login-buttons";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check for saved credentials
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRememberMe) {
      form.setFieldsValue({ email: savedEmail });
      setRememberMe(true);
    }
  }, [form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      dispatch(showLoading());
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('savedEmail', values.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('rememberMe');
      }

      const res = await axios.post("/api/v1/user/login", values);
      dispatch(hideLoading());
      setLoading(false);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        message.success({
          content: "Login successful!",
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
        navigate("/");
      } else {
        message.error({
          content: res.data.message,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
        });
      }
    } catch (error) {
      dispatch(hideLoading());
      setLoading(false);
      console.log(error);
      message.error({
        content: "Invalid email or password",
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    }
  };

  return (
    <div className="form-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="register-form"
        requiredMark={false}
      >
        <h1 className="form-title">Welcome Back!</h1>
        <p className="form-subtitle">Login to your account</p>

        <div className="social-login">
          <GoogleLoginButton onClick={() => message.info("Google login coming soon")} style={{ marginBottom: 10 }} />
          <FacebookLoginButton onClick={() => message.info("Facebook login coming soon")} />
        </div>

        <div className="divider">
          <span>or login with email</span>
        </div>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input 
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Enter your email"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Enter your password"
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <div className="remember-forgot">
          <Checkbox 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          >
            Remember me
          </Checkbox>
          <Link to="/forgot-password" className="form-link">
            Forgot password?
          </Link>
        </div>

        <button className="form-button" type="submit" disabled={loading}>
          {loading ? <span>Logging in<span className="loading-dots"></span></span> : "Login"}
        </button>

        <Link to="/register" className="form-link">
          Don't have an account? Register here
        </Link>
      </Form>
    </div>
  );
};

export default Login;