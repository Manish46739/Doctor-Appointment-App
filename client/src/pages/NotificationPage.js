import React, { useState } from "react";
import Layout from "./../components/Layout";
import { message, Tabs, Timeline, Card, Button, Badge, Empty, Popconfirm } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import "./NotificationPage.css";

const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("1");

  // handle read notification
  const handleMarkAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/get-all-notification",
        {
          userId: user._id,
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
        window.location.reload();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something went wrong");
    }
  };

  // delete notifications
  const handleDeleteAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/delete-all-notification",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
        window.location.reload();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something went wrong");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "apply-doctor-request":
        return "fa-user-md";
      case "New-appointment-request":
        return "fa-calendar-plus";
      case "status-updated":
        return "fa-check-circle";
      case "doctor-account-request-updated":
        return "fa-user-check";
      default:
        return "fa-bell";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "apply-doctor-request":
        return "#1890ff";
      case "New-appointment-request":
        return "#52c41a";
      case "status-updated":
        return "#faad14";
      case "doctor-account-request-updated":
        return "#722ed1";
      default:
        return "#1890ff";
    }
  };

  const renderNotificationItem = (notification, isRead = false) => (
    <Card 
      className="notification-card" 
      style={{ 
        marginBottom: '1rem',
        backgroundColor: isRead ? '#f8f9fa' : '#fff',
        borderLeft: `4px solid ${getNotificationColor(notification.type)}`
      }}
    >
      <div className="d-flex align-items-center">
        <div className="notification-icon">
          <i 
            className={`fas ${getNotificationIcon(notification.type)}`} 
            style={{ color: getNotificationColor(notification.type) }}
          ></i>
        </div>
        <div className="notification-content">
          <p className="notification-message">{notification.message}</p>
          <small className="text-muted">
            {moment(notification.createdAt).fromNow()}
          </small>
        </div>
        <Button 
          type="link" 
          onClick={() => navigate(notification.onClickPath)}
          className="ms-auto"
        >
          View Details
        </Button>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="notification-container">
        <div className="notification-header">
          <h2 className="page-title">
            <i className="fas fa-bell me-2"></i>
            Notifications
          </h2>
          <Badge count={user?.notifcation?.length || 0} className="notification-badge">
            <span className="notification-count-text">New Notifications</span>
          </Badge>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="notification-tabs"
          tabBarExtraContent={
            activeTab === "1" ? (
              <Button 
                type="primary" 
                onClick={handleMarkAllRead}
                disabled={!user?.notifcation?.length}
              >
                Mark All as Read
              </Button>
            ) : (
              <Popconfirm
                title="Are you sure you want to delete all read notifications?"
                onConfirm={handleDeleteAllRead}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="primary" 
                  danger
                  disabled={!user?.seennotification?.length}
                >
                  Delete All Read
                </Button>
              </Popconfirm>
            )
          }
        >
          <Tabs.TabPane tab={
            <span>
              <Badge dot={user?.notifcation?.length > 0}>
                Unread
              </Badge>
            </span>
          } key="1">
            <div className="notifications-list">
              {user?.notifcation?.length > 0 ? (
                <Timeline>
                  {user.notifcation.map((notification, index) => (
                    <Timeline.Item 
                      key={index}
                      color={getNotificationColor(notification.type)}
                    >
                      {renderNotificationItem(notification)}
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No unread notifications"
                />
              )}
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Read" key="2">
            <div className="notifications-list">
              {user?.seennotification?.length > 0 ? (
                <Timeline>
                  {user.seennotification.map((notification, index) => (
                    <Timeline.Item 
                      key={index}
                      color={getNotificationColor(notification.type)}
                    >
                      {renderNotificationItem(notification, true)}
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No read notifications"
                />
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Layout>
  );
};

export default NotificationPage;