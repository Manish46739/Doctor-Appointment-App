import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useSelector, useDispatch } from "react-redux";
import { Card, Form, Input, message, Upload, Statistic } from "antd";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";
import axios from "axios";
import "./UserProfile.css";

const UserProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(user?.profilePicture);
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    getAppointmentCount();
  }, []);

  const getAppointmentCount = async () => {
    try {
      const res = await axios.get("/api/v1/user/user-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setAppointmentCount(res.data.data.length);
      }
    } catch (error) {
      console.log(error);
      message.error("Error fetching appointment count");
    }
  };

  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/update-profile",
        {
          ...values,
          userId: user._id,
          profilePicture: imageUrl
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
        dispatch(setUser(res.data.data));
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something Went Wrong");
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await axios.post('/api/v1/user/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        setImageUrl(res.data.url);
        message.success('Image uploaded successfully');
      } else {
        message.error(res.data.message || 'Failed to upload image');
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.log(error);
      setLoading(false);
      message.error("Error uploading image");
      return false;
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Layout>
      <div className="profile-container">
        <Card className="profile-card">
          <div className="profile-header">
            <h1>User Profile</h1>
          </div>
          <div className="profile-content">
            <div className="appointment-stats">
              <Statistic
                title="Total Appointments"
                value={appointmentCount}
                prefix={<i className="fa-solid fa-calendar-check" style={{ marginRight: '8px', color: '#1a237e' }}></i>}
              />
            </div>
            <Form
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{
                name: user?.name,
                email: user?.email,
              }}
            >
              <div className="profile-picture-section">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="avatar" style={{ width: '100%', borderRadius: '50%' }} />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </div>

              <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                <Input placeholder="Your name" />
              </Form.Item>

              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>

              <div className="profile-actions">
                <button className="btn btn-primary" type="submit">
                  Update Profile
                </button>
              </div>
            </Form>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default UserProfile;