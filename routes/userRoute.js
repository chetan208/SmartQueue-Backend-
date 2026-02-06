import {Router} from 'express'
import { loginUser, registerUser, verifyUser ,generateTokenForPatient,getTokenDetails } from '../controllers/userControllers.js'
import checkAuth from '../services/checkAuth.js'

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


export default router;