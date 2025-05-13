import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DatePicker, message, TimePicker, Card, Row, Col } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { loadStripe } from "@stripe/stripe-js";
import "./BookingPage.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const getUserData = async () => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/getDoctorById",
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBooking = async () => {
    if (!date || !time) {
      return message.warning("Please select both date and time for the appointment.");
    }

    try {
      setIsLoading(true);
      dispatch(showLoading());
      const availabilityRes = await axios.post(
        "/api/v1/user/booking-availbility",
        { doctorId: params.doctorId, date, time },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!availabilityRes.data.success) {
        dispatch(hideLoading());
        setIsLoading(false);
        return message.warning("Selected slot is not available.");
      }

      const stripe = await stripePromise;
      const paymentRes = await axios.post(
        "/api/payment/create-checkout-session",
        {
          appointmentId: `DOC-${Date.now()}`,
          amount: doctors.feesPerCunsaltation * 100,
          userEmail: user.email,
          doctorId: params.doctorId,
          userId: user._id,
          date,
          time,
          amount: "paid"
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());
      setIsLoading(false);
      const session = paymentRes.data;
      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        message.error(result.error.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      setIsLoading(false);
      console.error(error);
      message.error("Something went wrong during booking.");
    }
  };

  const handleBookingWithoutPayment = async () => {
    if (!date || !time) {
      return message.warning("Please select both date and time for the appointment.");
    }

    try {
      setIsLoading(true);
      dispatch(showLoading());
      
      // Check availability first
      const availabilityRes = await axios.post(
        "/api/v1/user/booking-availbility",
        { doctorId: params.doctorId, date, time },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!availabilityRes.data.success) {
        dispatch(hideLoading());
        setIsLoading(false);
        return message.warning("Selected slot is not available.");
      }

      // Create appointment without payment
      const res = await axios.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctors,
          userInfo: user,
          date: date,
          time: time,
          paymentStatus: "pending",
          amount: "unpaid"
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());
      setIsLoading(false);

      if (res.data.success) {
        message.success("Appointment request sent to doctor successfully!");
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
      dispatch(hideLoading());
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
    // eslint-disable-next-line
  }, []);

  if (!doctors) return null;

  return (
    <Layout>
      <div className="booking-container">
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={24} md={12} lg={8}>
            <Card 
              className="doctor-info-card"
              cover={
                <div className="doctor-image" style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "linear-gradient(45deg, #1a237e, #0d47a1)",
                  padding: "2rem 0"
                }}>
                  <img
                    src={doctors.profilePicture || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"}
                    alt="doctor"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "4px solid white",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                    }}
                  />
                </div>
              }
            >
              <div className="doctor-details">
                <h2>Dr. {doctors.firstName} {doctors.lastName}</h2>
                <div className="info-item">
                  <i className="fas fa-user-md"></i>
                  <span>{doctors.specialization}</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-graduation-cap"></i>
                  <span>{doctors.experience} Years Experience</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <span>{doctors.timings?.[0]} - {doctors.timings?.[1]}</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-indian-rupee-sign"></i>
                  <span>₹{doctors.feesPerCunsaltation}</span>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={24} md={12} lg={8}>
            <Card className="booking-form-card">
              <h3>Book Appointment</h3>
              <div className="date-time-picker">
                <div className="picker-item">
                  <label>Select Date</label>
                  <DatePicker
                    className="custom-picker"
                    format="DD-MM-YYYY"
                    onChange={(value) => {
                      setDate(moment(value).format("DD-MM-YYYY"));
                    }}
                  />
                </div>
                <div className="picker-item">
                  <label>Select Time</label>
                  <TimePicker
                    className="custom-picker"
                    format="HH:mm"
                    onChange={(value) => {
                      setTime(moment(value).format("HH:mm"));
                    }}
                  />
                </div>
              </div>
              <div className="booking-buttons">
                <button 
                  className={`booking-button ${isLoading ? 'loading' : ''}`}
                  onClick={handleBooking}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Book & Pay Now'}
                </button>
                <button 
                  className={`booking-button booking-button-secondary ${isLoading ? 'loading' : ''}`}
                  onClick={handleBookingWithoutPayment}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Request Appointment'}
                </button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default BookingPage;
