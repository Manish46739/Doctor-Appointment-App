const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Fetching Doctor Details",
    });
  }
};

// update doc profile
const updateProfileController = async (req, res) => {
  try {
    const { userId, profilePicture, ...updateData } = req.body;
    
    // Update doctor profile
    const doctor = await doctorModel.findOneAndUpdate(
      { userId },
      { ...updateData, profilePicture },
      { new: true }
    );

    // If profile picture is being updated, sync it with user model
    if (profilePicture) {
      await userModel.findByIdAndUpdate(
        userId,
        { profilePicture },
        { new: true }
      );
    }

    res.status(201).send({
      success: true,
      message: "Doctor Profile Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Doctor Profile Update issue",
      error,
    });
  }
};

//get single docotor
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    // Always try to get the user's profile picture as it might be more up to date
    const user = await userModel.findById(doctor.userId);
    const doctorData = doctor.toObject();
    if (user) {
      // Use user's profile picture if it exists, otherwise keep doctor's profile picture
      doctorData.profilePicture = user.profilePicture || doctorData.profilePicture;
    }

    res.status(200).send({
      success: true,
      message: "Single Doc Info Fetched",
      data: doctorData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Single doctor info",
    });
  }
};

const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    const appointments = await appointmentModel.find({
      doctorId: doctor._id,
    });

    // Ensure appointments have valid JSON strings for doctorInfo and userInfo
    const formattedAppointments = await Promise.all(appointments.map(async (apt) => {
      const appointment = apt.toObject();
      try {
        // First try to parse existing JSON strings
        appointment.doctorInfo = JSON.parse(appointment.doctorInfo);
        appointment.userInfo = JSON.parse(appointment.userInfo);
      } catch (error) {
        // If parsing fails, try to fetch user info directly
        if (appointment.userId) {
          const user = await userModel.findById(appointment.userId);
          if (user) {
            appointment.userInfo = JSON.stringify({
              name: user.name,
              email: user.email
            });
          } else {
            appointment.userInfo = JSON.stringify({ name: "Patient not found" });
          }
        } else {
          appointment.userInfo = JSON.stringify({ name: "Patient not found" });
        }

        // Handle doctorInfo if it's not valid JSON
        if (typeof appointment.doctorInfo === 'object') {
          appointment.doctorInfo = JSON.stringify(appointment.doctorInfo);
        }
      }
      return appointment;
    }));

    res.status(200).send({
      success: true,
      message: "Doctor Appointments fetch Successfully",
      data: formattedAppointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Doc Appointments",
    });
  }
};

const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    
    // Update appointment status
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status }
    );

    // Get doctor info for notification
    const doctor = await doctorModel.findById(appointment.doctorId);
    
    // Send notification to patient
    const user = await userModel.findOne({ _id: appointment.userId });
    if (user) {
      const notifcation = user.notifcation;
      notifcation.push({
        type: "appointment-status-updated",
        message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been ${status}`,
        onClickPath: "/appointments",
      });
      await user.save();
    }

    res.status(200).send({
      success: true,
      message: `Appointment ${status} successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Update Status",
    });
  }
};

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
};