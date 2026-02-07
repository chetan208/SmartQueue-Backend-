import { Router } from "express";
import {
  loginUser,
  registerUser,
  verifyUser,
  generateTokenForPatient,
  getTokenDetails,
  checkDepartmentAccess,
  resumeToken,
  pauseToken,
  completeToken,
  getAverageQueueTime
} from "../controllers/userControllers.js";
import checkAuth from "../services/checkAuth.js";
import checkForAuthenticationCookieMiddelware from "../middelwares/protect.js";
import { get } from "mongoose";

const router = Router();

// /api/users

router.get("/", (req, res) => {
  res.send("User route is working");
});

router.post("/register", registerUser);

router.post("/verify-user/:email", verifyUser);

router.post("/login", loginUser);

router.post("/generate-token", generateTokenForPatient);

router.get("/check-auth", checkAuth);

router.get("/token-details/:id", getTokenDetails);

router.get(
  "/departments-accessible",
  checkForAuthenticationCookieMiddelware("token"),
  checkDepartmentAccess,
);

router.get(
  `/resume-token/:id`,
  checkForAuthenticationCookieMiddelware("token"),
  resumeToken,
);

router.get(
  "/pause-token/:id",
  checkForAuthenticationCookieMiddelware("token"),
  pauseToken,
);

router.get("/complete-token/:id", checkForAuthenticationCookieMiddelware("token"),completeToken)

router.get("/queue/average-time/:departmentId", getAverageQueueTime);

export default router;
