import React from "react";
import { useNavigate } from "react-router-dom";
import { Col } from "antd";

const DEFAULT_DOCTOR_IMAGE = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";

const DoctorList = ({ doctor }) => {
  const navigate = useNavigate();
  return (
    <Col xs={24} sm={24} lg={8} className="mb-4">
      <div
        className="card h-100"
        style={{ cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
        onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
      >
        <div className="card-img-top text-center pt-3">
          <img
            src={doctor.profilePicture || DEFAULT_DOCTOR_IMAGE}
            onError={(e) => {
              if (e.target.src !== DEFAULT_DOCTOR_IMAGE) {
                e.target.src = DEFAULT_DOCTOR_IMAGE;
              }
            }}
            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
            className="rounded-circle"
            style={{ 
              width: "150px", 
              height: "150px", 
              objectFit: "cover",
              border: "3px solid #f0f0f0"
            }}
          />
        </div>
        <div className="card-body">
          <h5 className="card-title text-center mb-3">
            Dr. {doctor.firstName} {doctor.lastName}
          </h5>
          <div className="card-text">
            <p className="mb-2">
              <i className="fa-solid fa-user-md me-2 text-primary"></i>
              <b>Specialization:</b> {doctor.specialization}
            </p>
            <p className="mb-2">
              <i className="fa-solid fa-clock me-2 text-primary"></i>
              <b>Experience:</b> {doctor.experience} years
            </p>
            <p className="mb-2">
              <i className="fa-solid fa-indian-rupee-sign me-2 text-primary"></i>
              <b>Fee:</b> ₹{doctor.feesPerCunsaltation}
            </p>
            <p className="mb-2">
              <i className="fa-solid fa-calendar-check me-2 text-primary"></i>
              <b>Timings:</b> {doctor.timings?.[0]} - {doctor.timings?.[1]}
            </p>
          </div>
        </div>
        <div className="card-footer bg-white border-top-0 text-center">
          <button className="btn btn-primary">Book Appointment</button>
        </div>
      </div>
    </Col>
  );
};

export default DoctorList;
