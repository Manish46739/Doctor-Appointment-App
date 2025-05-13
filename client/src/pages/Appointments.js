import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import moment from "moment";
import { Table, Tag } from "antd";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  const getAppointments = async () => {
    try {
      const res = await axios.get("/api/v1/user/user-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const columns = [
    {
      title: "Doctor",
      dataIndex: "doctorInfo",
      render: (doctorInfo) => {
        const info = JSON.parse(doctorInfo);
        return <span>Dr. {info.firstName} {info.lastName}</span>;
      }
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (text, record) => (
        <span>
          {moment(record.date).format("DD-MM-YYYY")} &nbsp;
          {moment(record.time).format("HH:mm")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={
          status === "pending" ? "gold" :
          status === "approved" ? "green" :
          "red"
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      render: (paymentStatus) => (
        <Tag color={paymentStatus === "completed" ? "green" : "orange"}>
          {paymentStatus.toUpperCase()}
        </Tag>
      )
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount) => (
        <Tag color={amount === "paid" ? "green" : "red"}>
          {amount?.toUpperCase() || "UNPAID"}
        </Tag>
      )
    }
  ];

  return (
    <Layout>
      <h1>My Appointments</h1>
      <Table columns={columns} dataSource={appointments} />
    </Layout>
  );
};

export default Appointments;