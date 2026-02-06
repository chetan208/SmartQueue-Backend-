import uploadBase64 from "../config/uploadBase64.js";
import uploadBufferToCloudinary from "../config/uploadToCloudinary.js";
import imageModel from "../model/accetsModels/imageModel.js";
import departmentModel from "../model/hospitalRegistrationModels/departmentModel.js";
import DoctorModel from "../model/hospitalRegistrationModels/DoctorModel.js";
import hospitalModel  from "../model/hospitalRegistrationModels/hospitalModel.js"


const addDepartment = async (req, res) => {
  const { departmentName, description, workingSchedule, doctors } =
    req.body;

    const email = req.user.email
   const hospital = await hospitalModel.findOne({ email });
    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found",
      });
    }

   
  if (!departmentName || !workingSchedule || !doctors) {
    return res.json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    let doctorsIds = [];

    for (const doctor of doctors) {
      const newDoctor = await DoctorModel.create({
        name: doctor.name,
        specialization: doctor.specialization,
        availableDays: doctor.availabilityDays,
      });

      doctorsIds.push(newDoctor._id);
    }

   




    const newDepartment = await departmentModel.create({
      name: departmentName,
      description,
      workingSchedule: {
        is24X7: workingSchedule.is24X7,
        workingDays: workingSchedule.workingDays,
        timeSlots: workingSchedule.timeSlots.map((slot) => ({
          openingTime: slot.openingTime,
          closingTime: slot.closingTime,
        })),
      },
      Doctors: [...doctorsIds],
    });

    hospital.departments.push(newDepartment._id);
    await hospital.save();

    res.json({
      success: true,
      message: "Department added successfully",
      departmentId: newDepartment._id,
    });
  } catch (error) {
    console.log("Error adding department:", error);
    res.json({
      success: false,
      message: "Error adding department.",
    });
  }
};

const uploadImage = async(req,res) => {
  const mainPhoto = req.files.mainEntrancePhoto?.[0];
  const additionalPhotos = req.files.additionalPhotos || [];

  const {departmentId} = req.body;


  try {


    const result = await uploadBufferToCloudinary(mainPhoto.buffer,"departmentphoto/entrance")

    const mainEntrance = await imageModel.create({
      url: result.secure_url,
      publicId: result.public_id,
    })

    let additionalPhotosIds = [];

  
    for (const photo of additionalPhotos){
    const result2 = await uploadBufferToCloudinary(photo.buffer,"departmentphotos/additonalPhots")
      const additionalPhoto = await imageModel.create({
        url: result2.secure_url,
        publicId: result2.public_id,
      })
      additionalPhotosIds.push(additionalPhoto._id)
    }

    

    const department = await departmentModel.findById(departmentId);
    if (!department) {
      return res.json({
        success: false,
        message: "Department not found",
      });
    }

    department.entrancePhoto = mainEntrance._id;
    department.additionalPhotos = [...additionalPhotosIds];
    await department.save();

    res.json({
      success:true,
      message:"Files uploaded successfully",
    })

  } catch (error) {
    console.log("error in uploading fiels",error)
    res.json({
      success:false,
      message:"error in uploading files"
    })
    
  }
}



export { addDepartment , uploadImage };
