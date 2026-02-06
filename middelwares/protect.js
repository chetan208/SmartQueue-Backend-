import jwt from "jsonwebtoken";

const checkForAuthenticationCookieMiddelware = (cookieName) => {
  return (req, res, next) => {

  

    const cookieValue = req.cookies?.[cookieName];

    if (!cookieValue) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    try {
      const payload = jwt.verify(cookieValue, process.env.JWT_SECRET);
    
      req.user = payload;
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  };
};

export default checkForAuthenticationCookieMiddelware;
