import {Router} from 'express'
import { loginUser, registerUser, verifyUser ,generateTokenForPatient,getTokenDetails,checkDepartmentAccess } from '../controllers/userControllers.js'
import checkAuth from '../services/checkAuth.js'
import checkForAuthenticationCookieMiddelware from "../middelwares/protect.js";

const router = Router()


// /api/users

router.get('/', (req, res) => {
    res.send('User route is working')
})

router.post('/register', registerUser )

router.post('/verify-user/:email', verifyUser)

router.post('/login', loginUser)

router.post('/generate-token', generateTokenForPatient)

router.get('/check-auth', checkAuth)

router.get('/token-details/:id',getTokenDetails)

router.get('/departments-accessible', checkForAuthenticationCookieMiddelware("token"), checkDepartmentAccess)


export default router;