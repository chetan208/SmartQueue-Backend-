import HospitalModel from "../model/hospitalRegistrationModels/hospitalModel.js";
import departmentModel from "../model/hospitalRegistrationModels/departmentModel.js";
import UserModel from "../model/Users/usermodel.js";

const searchHospitals = async (req, res) => {
  try {
    const { q } = req.query;

    // Validate search query
    if (!q || q.trim().length < 1) {
      return res.json([]);
    }

    const words = q.trim().split(/\s+/);

    const conditions = words.flatMap(word => [
      { name: { $regex: word, $options: "i" } },
      { "address.city": { $regex: word, $options: "i" } },
      { "address.state": { $regex: word, $options: "i" } },
      { "address.pincode": { $regex: word, $options: "i" } },
    ]);

    const hospitals = await HospitalModel.aggregate([
      // Lookup Address
      {
        $lookup: {
          from: "addresses",
          localField: "address",
          foreignField: "_id",
          as: "address"
        }
      },
      {
        $unwind: {
          path: "$address",
          preserveNullAndEmptyArrays: true
        }
      },
      // Lookup Logo from Image collection
      {
        $lookup: {
          from: "images",
          localField: "branding.logo",
          foreignField: "_id",
          as: "logoData"
        }
      },
      {
        $unwind: {
          path: "$logoData",
          preserveNullAndEmptyArrays: true
        }
      },
      // Lookup Banner from Image collection
      {
        $lookup: {
          from: "images",
          localField: "branding.banner",
          foreignField: "_id",
          as: "bannerData"
        }
      },
      {
        $unwind: {
          path: "$bannerData",
          preserveNullAndEmptyArrays: true
        }
      },
      // Match search conditions
      {
        $match: {
          $or: conditions
        }
      },
      // Project only required fields
      {
        $project: {
          name: 1,
          email: 1,
          phoneNumber: 1,
          website: 1,
          hospitalDiscription: 1,
          hospitalType: 1,
          hospitalTimings: 1,
          isVerified: 1,
          address: 1,
          logoData: 1,
          bannerData: 1
        }
      },
      {
        $limit: 20
      }
    ]);

    res.json(hospitals);

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

const getHospitalBasicInfo = async (req, res) => {
  const  hospitalEmail = req.user.email

  if (!hospitalEmail) {
    return res.json({
      success: false,
      message: "Hospital Email is required",
    });
  }

  try {
    const hospital = await HospitalModel.findOne({ email: hospitalEmail })

      .populate({
        path: "departments",
        select: "name description status Doctors",
      })

      .select("name departments"); // security

    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found",
      });
    }
    res.json({
      success: true,
      hospital,
    });
  } catch (error) {
    console.error("Error fetching hospital info:", error);
    res.json({
      success: false,
      message: "Failed to fetch hospital information",
    });
  }
};

const getDepartmentDetails = async (req, res) => {
  const  hospitalEmail  = req.user.email;


  if (!hospitalEmail) {
    return res.json({
      success: false,
      message: "Hospital Email is required",
    });
  }

  try {
    const hospital = await HospitalModel.findOne({ email: hospitalEmail })

      .populate({
        path: "departments",
        select:
          "name description status Doctors workingSchedule departmentAddress entrancePhoto",
        populate: {
          path: "entrancePhoto",
          select: "url",
        },
      })

      .select("name departments"); // security

    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found",
      });
    }

    res.json({
      success: true,
      hospital,
    });
  } catch (error) {
    console.error("Error fetching department details:", error);
    res.json({
      success: false,
      message: "Failed to fetch department details",
    });
  }
};

const hospitalInfo = async (req, res) => {
  const  hospitalEmail = req.user.email

  

 

  if (!hospitalEmail) {
   
    return res.json({
      success: false,
      message: "Hospital Email is required",
    });
  }
  try {
    const hospital = await HospitalModel.findOne({ email: hospitalEmail })
      .populate("address")
      .populate({
        path: "branding.logo",
        select: "url",
      })
      .populate({
        path: "branding.banner",
        select: "url",
      })
      .select("-password -__v"); // security

    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found",
      });
    }
    res.json({
      success: true,
      hospital,
    });
  } catch (error) {
    console.log("error in hospitalInfo:", error);
    res.json({
      success: false,
      message: "Failed to fetch hospital information",
    });
  }
};

const hospitalInfoForPublic = async (req, res) => {
  const { hospitalId } = req.params;

  if (!hospitalId) {
    return res.json({
      success: false,
      message: "Hospital ID is required",
    });
  }

  try {
    const hospital = await HospitalModel.findById(hospitalId)
      .populate("address")
      .populate({
        path: "branding.logo",
        select: "url",
      })
      .populate({
        path: "branding.banner",
        select: "url",
      })
      .populate({
        path: "departments",
        select: "name description status Doctors workingSchedule departmentAddress entrancePhoto",
        populate: {
          path: "entrancePhoto",
          select: "url",
        },
      })
      .select("-password -__v"); // security

    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found",
      });
    }
    res.json({
      success: true,
      hospital,
    });
  } catch (error) {
    console.log("error in hospitalInfoForPublic:", error);
    res.json({
      success: false,
      message: "Failed to fetch hospital information",
    });
  }
}

const getSingleDepartmentDetail = async (req, res) => {
  const { departmentId } = req.params;

  if (!departmentId) {
    return res.json({
      success: false,
      message: "Department ID is required",
    });
  }

  try {
    const department = await departmentModel.findById(departmentId)
      .populate({
        path: "entrancePhoto",
        select: "url",
      })
      .populate({
        path: "additionalPhotos",
        select: "url",
      });

    if (!department) {
      return res.json({
        success: false,
        message: "Department not found",
      });
    }

    res.json({
      success: true,
      department,
    });
  } catch (error) {
    console.log("Error fetching single department detail:", error);
    res.json({
      success: false,
      message: "Failed to fetch department detail",
    });
    
  }
}


const addDepartmentAdmin = async (req, res) => {
  const { departmentId, adminEmail } = req.body;

  if (!departmentId || !adminEmail) {
    return res.json({
      success: false,
      message: "Department ID and Admin Email are required",
    });
  }

  try {
    const department = await departmentModel.findById(departmentId);

    if (!department) {
      return res.json({
        success: false,
        message: "Department not found",
      });
    }
    
    // check if the requesting user is an admin of the hospital
    const hospital = await HospitalModel.findOne({ departments: departmentId });

    if (!hospital) {
      return res.json({
        success: false,
        message: "Associated hospital not found",
      });
    }

    if(hospital.email !== req.user.email){
      return res.json({
        success: false,
        message: "Unauthorized: Only hospital admins can add department admins",
      });
    }

    // Find the user by email
    const userToAdd = await UserModel.findOne({ email: adminEmail });

    if (!userToAdd) {
      return res.json({
        success: false,
        message: "User with the provided email not found",
      });
    }

    // Check if the user is already an admin of the department
    if (department.admins.includes(userToAdd._id)) {
      return res.json({
        success: false,
        message: "User is already an admin of this department",
      });
    }

    // Add the user to the department's admins array
    userToAdd.role = "departmentAdmin"; // Update user role to departmentAdmin
    userToAdd.departmentsAccess.push(departmentId); // Add department to user's departments array
    await userToAdd.save();
    department.admins.push(userToAdd._id);
    await department.save();

    res.json({
      success: true,
      message: "Admin added to the department successfully",
    });
    
  } catch (error) {

    console.log("Error adding department admin:", error);
    res.json({
      success: false,
      message: "Failed to add department admin",
    });
    
  }
}

const fetchDepartmentAdmin = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.json({
      success: false,
      message: "Department ID is required",
    });
  }
  try {
    const department = await departmentModel.findById(id).populate("admins", "name email");
    if (!department) {
      return res.json({
        success: false,
        message: "Department not found",
      });
    }
    res.json({
      success: true,
      admins: department.admins,
    });
  } catch (error) {
    console.log("Error fetching department admins:", error);
    res.json({
      success: false,
      message: "Failed to fetch department admins",
    });
  }
}

export {
  searchHospitals,
  getHospitalBasicInfo,
  getDepartmentDetails,
  hospitalInfo,
  hospitalInfoForPublic,
  getSingleDepartmentDetail,
  addDepartmentAdmin,
  fetchDepartmentAdmin
};
