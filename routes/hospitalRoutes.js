import {Router} from 'express'
import { loginHospital, registerHospital ,verifyHospitalEmail,setPassword,branding} from '../controllers/hospitalRegistrationController.js';
import { addDepartment ,uploadImage} from '../controllers/departmentRegistrationController.js';
import { getDepartmentDetails, getHospitalBasicInfo, hospitalInfo, searchHospitals,hospitalInfoForPublic } from '../controllers/hospitalControllers.js';
import upload from '../middelwares/upload.js';
import checkForAuthenticationCookieMiddelware from '../middelwares/protect.js';


const router = Router();

// api/hospitals

router.get('/', (req, res) => {
    res.send("Hospital Routes Working")
});


router.post('/register', registerHospital)

router.post('/verify/:email',verifyHospitalEmail)

router.post('/add-department',checkForAuthenticationCookieMiddelware("token"), addDepartment  )

router.post('/login', loginHospital)

router.get('/search', searchHospitals)

router.post('/set-password', setPassword)

router.post('/branding', upload.fields([{ name: "logo" }, { name: "banner" }]), branding )

router.post(
  '/department/upload-image',
  upload.fields([
    { name: 'mainEntrancePhoto', maxCount: 1 },
    { name: 'additionalPhotos', maxCount: 10 },
  ]),
  uploadImage
);

router.get('/basic-info',checkForAuthenticationCookieMiddelware("token"),getHospitalBasicInfo )

router.get('/department-details',checkForAuthenticationCookieMiddelware("token"),getDepartmentDetails)

router.get('/hospital-info',checkForAuthenticationCookieMiddelware("token"),hospitalInfo)

router.get('/hospital-info/:hospitalId', hospitalInfoForPublic)

export default router;