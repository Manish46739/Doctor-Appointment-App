import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Col, Form, Input, Row, TimePicker, message, Upload, Alert } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import moment from "moment";
import { LoadingOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import "./Profile.css";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    monthlyAppointments: 0,
    completedAppointments: 0
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  // Get doctor stats
  const getDoctorStats = async () => {
    try {
      const res = await axios.get("/api/v1/doctor/doctor-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (res.data.success) {
        const appointments = res.data.data;
        const total = appointments.length;
        const completed = appointments.filter(app => app.status === "approved").length;
        const monthly = appointments.filter(app => {
          const appointmentDate = moment(app.date);
          const currentDate = moment();
          return appointmentDate.isSame(currentDate, 'month');
        }).length;

        setStats({
          totalAppointments: total,
          monthlyAppointments: monthly,
          completedAppointments: completed
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle form
  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/doctor/updateProfile",
        {
          ...values,
          userId: user._id,
          profilePicture: imageUrl,
          timings: [
            moment(values.startTime).format("HH:mm"),
            moment(values.endTime).format("HH:mm"),
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        getDoctorInfo();
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
        
        const updateRes = await axios.post(
          "/api/v1/doctor/updateProfile",
          {
            userId: user._id,
            profilePicture: res.data.url
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (updateRes.data.success) {
          message.success('Profile picture updated successfully');
        }
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

  // getDOc Details
  const getDoctorInfo = async () => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/getDoctorInfo",
        { userId: params.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setDoctor(res.data.data);
        setImageUrl(res.data.data.profilePicture);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDoctorInfo();
    getDoctorStats();
    //eslint-disable-next-line
  }, []);

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Layout>
      <div className="doctor-profile-container">
        <div className="profile-header animate-fade-in">
          <h1>Manage Your Profile</h1>
          <div className="specialization-tag">{doctor?.specialization}</div>
        </div>

        {showSuccess && (
          <Alert
            message="Profile Updated Successfully"
            type="success"
            showIcon
            className="success-alert"
          />
        )}

        <Row gutter={[24, 24]} className="stats-row animate-fade-in">
          <Col xs={24} sm={8}>
            <div className="stat-card">
              <div className="stat-value">{stats.totalAppointments}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="stat-card">
              <div className="stat-value">{stats.monthlyAppointments}</div>
              <div className="stat-label">This Month</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="stat-card">
              <div className="stat-value">{stats.completedAppointments}</div>
              <div className="stat-label">Completed</div>
            </div>
          </Col>
        </Row>

        {doctor && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              ...doctor,
              startTime: doctor.timings?.[0] ? moment(doctor.timings[0], "HH:mm") : null,
              endTime: doctor.timings?.[1] ? moment(doctor.timings[1], "HH:mm") : null
            }}
            className="profile-form animate-fade-in"
          >
            <div className="profile-picture-section">
              <div className="profile-picture-wrapper">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                >
                  {imageUrl ? (
                    <>
                      <img 
                        src={imageUrl} 
                        alt="avatar" 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <div className="edit-overlay">
                        <EditOutlined />
                      </div>
                    </>
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </div>
            </div>

            <h4 className="section-title">Personal Details</h4>
            <Row gutter={20}>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  required
                  rules={[{ required: true }]}
                >
                  <Input className="form-input" type="text" placeholder="Your first name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  required
                  rules={[{ required: true }]}
                >
                  <Input className="form-input" type="text" placeholder="Your last name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Phone No"
                  name="phone"
                  required
                  rules={[{ required: true }]}
                >
                  <Input className="form-input" type="text" placeholder="Your contact number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  required
                  rules={[{ required: true, type: 'email' }]}
                >
                  <Input className="form-input" type="email" placeholder="Your email address" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item label="Website" name="website">
                  <Input className="form-input" type="text" placeholder="Your website" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Address"
                  name="address"
                  required
                  rules={[{ required: true }]}
                >
                  <Input className="form-input" type="text" placeholder="Your clinic address" />
                </Form.Item>
              </Col>
            </Row>

            <h4 className="section-title">Professional Details</h4>
            <Row gutter={20}>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Specialization"
                  name="specialization"
                  required
                  rules={[{ required: true }]}
                >
                  <Input className="form-input" type="text" placeholder="Your specialization" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Experience"
                  name="experience"
                  required
                  rules={[{ required: true }]}
                >
                  <Input className="form-input" type="text" placeholder="Your experience" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Consultation Fee"
                  name="feesPerCunsaltation"
                  required
                  rules={[{ required: true }]}
                >
                  <Input className="form-input" type="number" placeholder="Your consultation fee" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Start Time"
                  name="startTime"
                  required
                  rules={[{ required: true, message: 'Please select start time' }]}
                >
                  <TimePicker
                    use12Hours
                    format="h:mm A"
                    className="form-input"
                    placeholder="Select start time"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="End Time"
                  name="endTime"
                  required
                  rules={[
                    { required: true, message: 'Please select end time' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const startTime = getFieldValue('startTime');
                        if (!startTime || !value) {
                          return Promise.resolve();
                        }
                        if (value.isSame(startTime) || value.isBefore(startTime)) {
                          return Promise.reject(new Error('End time must be after start time'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <TimePicker
                    use12Hours
                    format="h:mm A"
                    className="form-input"
                    placeholder="Select end time"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="text-center mt-4">
              <button className="submit-button" type="submit">
                Update Profile
              </button>
            </div>
          </Form>
        )}
      </div>
    </Layout>
  );
};

export default Profile;