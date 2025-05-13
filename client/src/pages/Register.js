import React, { useState } from "react";
import "../styles/RegisterStyles.css";
import { Form, Input, message, Checkbox, Progress } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { GoogleLoginButton, FacebookLoginButton } from "react-social-login-buttons";
import zxcvbn from 'zxcvbn';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);

  const validatePassword = (value) => {
    if (value) {
      const result = zxcvbn(value);
      setPasswordScore(result.score);
      return result;
    }
    return null;
  };

  const getPasswordStrengthColor = (score) => {
    const colors = ['#ff4d4f', '#faad14', '#faad14', '#52c41a', '#52c41a'];
    return colors[score] || colors[0];
  };

  const getPasswordStrengthText = (score) => {
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return texts[score] || texts[0];
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      dispatch(showLoading());
      const res = await axios.post("/api/v1/user/register", values);
      dispatch(hideLoading());
      setLoading(false);

      if (res.data.success) {
        message.success({
          content: "Registration successful! Redirecting to login...",
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
        setTimeout(() => navigate("/login"), 2000);
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
        content: "Something went wrong",
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
        <h1 className="form-title">Create Account</h1>
        <p className="form-subtitle">Get started with your free account</p>

        <div className="social-login">
          <GoogleLoginButton onClick={() => message.info("Google login coming soon")} style={{ marginBottom: 10 }} />
          <FacebookLoginButton onClick={() => message.info("Facebook login coming soon")} />
        </div>

        <div className="divider">
          <span>or register with email</span>
        </div>

        <Form.Item
          label="Full Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter your name' },
            { min: 3, message: 'Name must be at least 3 characters' }
          ]}
        >
          <Input 
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Enter your full name"
          />
        </Form.Item>

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
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Create a password"
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onChange={handlePasswordChange}
          />
        </Form.Item>

        {password && (
          <div style={{ marginBottom: 24 }}>
            <Progress
              percent={passwordScore * 25}
              strokeColor={getPasswordStrengthColor(passwordScore)}
              showInfo={false}
            />
            <div className={`password-strength strength-${getPasswordStrengthText(passwordScore).toLowerCase()}`}>
              Password Strength: {getPasswordStrengthText(passwordScore)}
            </div>
          </div>
        )}

        <Form.Item
          name="remember"
          valuePropName="checked"
        >
          <Checkbox>
            I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
          </Checkbox>
        </Form.Item>

        <button className="form-button" type="submit" disabled={loading}>
          {loading ? <span>Creating Account<span className="loading-dots"></span></span> : "Create Account"}
        </button>

        <Link to="/login" className="form-link">
          Already have an account? Login here
        </Link>
      </Form>
    </div>
  );
};

export default Register;