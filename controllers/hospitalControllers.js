
import HospitalModel from "../model/hospitalRegistrationModels/hospitalModel.js";

const searchHospitals = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const words = q
  .trim()
  .split(/\s+/); // multiple spaces handle

  const conditions = words.flatMap(word => [
  { name: { $regex: word, $options: "i" } },
  { "address.city": { $regex: word, $options: "i" } },
  { "address.state": { $regex: word, $options: "i" } },
  { "address.zipCode": { $regex: word, $options: "i" } }
]);

    const hospitals = await HospitalModel.aggregate([
      {
        $lookup: {
          from: "addresses",       // Address collection name (plural)
          localField: "address",
          foreignField: "_id",
          as: "address"
        }
      },
      {
        $unwind: "$address"
      },
      {
        $match: {
          $or: conditions
        }
      }
    ]);

    res.json(hospitals);

  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};

const getHospitalBasicInfo = async (req, res) => {
  const { hospitalEmail } = req.params;

  if (!hospitalEmail) {
    return res.json({ 
      success: false,
      message: "Hospital Email is required" });
  }

  try {

    const hospital = await HospitalModel.findOne({ email: hospitalEmail })

     .populate({
      path: "departments",
      select: "name description status Doctors"
      
     })
     
    
      .select("name departments"); // security


    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found"
      });
    }
    res.json({
      success: true,
      hospital
    });
    
  } catch (error) {
    console.error("Error fetching hospital info:", error);
    res.json({
      success: false,
      message: "Failed to fetch hospital information"
    })
    
  }
}

const getDepartmentDetails = async (req, res) => {
  const { hospitalEmail } = req.params;

  if (!hospitalEmail) {
    return res.json({ 
      success: false,
      message: "Hospital Email is required" });
  }

  try {
    const hospital = await HospitalModel.findOne({ email: hospitalEmail })

      .populate({
        path: "departments",
        select: "name description status Doctors workingSchedule departmentAddress entrancePhoto",
        populate: {
          path: "entrancePhoto",
          select: "url"
        },
        
        

      
     })
      

      .select("name departments"); // security



    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found"
      });
    }

    res.json({
      success: true,
      hospital
    });
    
  } catch (error) {

    console.error("Error fetching department details:", error);
    res.json({
      success: false,
      message: "Failed to fetch department details"
    })
    
  }
}


const hospitalInfo= async (req, res) => { 
  const { hospitalEmail } = req.params;
  if (!hospitalEmail) {
    return res.json({
      success: false,
      message: "Hospital Email is required"
    });
  }
  try {
    
const hospital = await HospitalModel.findOne({ email: hospitalEmail })
  .populate("address")
  .populate({
    path: "branding.logo",
    select: "url"
  })
  .populate({
    path: "branding.banner",
    select: "url"
  })
    .select("-password -__v"); // security

    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found"
      });
    }
    res.json({
      success: true,
      hospital
    });

  } catch (error) {
    console.log("error in hospitalInfo:",error);
    res.json({
      success: false,
      message: "Failed to fetch hospital information"
    });
  }
}



export { searchHospitals, getHospitalBasicInfo, getDepartmentDetails,hospitalInfo };