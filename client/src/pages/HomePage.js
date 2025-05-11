import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import { Row, Col, Input, Select } from "antd";
import DoctorList from "../components/DoctorList";

const { Search } = Input;

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Get all doctors
  const getUserData = async () => {
    try {
      const res = await axios.get("/api/v1/user/getAllDoctors", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        // Ensure each doctor has a profile picture
        const doctorsWithPictures = res.data.data.map(doc => ({
          ...doc,
          profilePicture: doc.profilePicture || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
        }));
        setDoctors(doctorsWithPictures);
        setFilteredDoctors(doctorsWithPictures);
        // Extract unique specializations
        const uniqueSpecializations = [...new Set(doctorsWithPictures.map(doc => doc.specialization))];
        setSpecializations(uniqueSpecializations);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  // Filter doctors based on search and specialization
  useEffect(() => {
    let result = [...doctors];
    
    if (searchTerm) {
      result = result.filter(doc => 
        doc.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSpecialization) {
      result = result.filter(doc => doc.specialization === selectedSpecialization);
    }
    
    setFilteredDoctors(result);
  }, [searchTerm, selectedSpecialization, doctors]);

  return (
    <Layout>
      <div className="container">
        <h1 className="text-center mb-4">Find a Doctor</h1>
        
        {/* Search and Filter Section */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} md={16}>
            <Search
              placeholder="Search by name or specialization"
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              size="large"
              style={{ width: "100%" }}
              placeholder="Filter by specialization"
              onChange={value => setSelectedSpecialization(value)}
              value={selectedSpecialization}
            >
              <Select.Option value="">All Specializations</Select.Option>
              {specializations.map(spec => (
                <Select.Option key={spec} value={spec}>{spec}</Select.Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Doctors List */}
        <Row gutter={[16, 16]}>
          {filteredDoctors.map((doctor) => (
            <DoctorList key={doctor._id} doctor={doctor} />
          ))}
          {filteredDoctors.length === 0 && (
            <Col span={24}>
              <div className="text-center py-4">
                <h3>No doctors found matching your criteria</h3>
              </div>
            </Col>
          )}
        </Row>
      </div>
    </Layout>
  );
};

export default HomePage;