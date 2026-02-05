const { validateToken } = require("../services/auth");

function checkForAuthenticationCookieMiddelware(cookieName) {
    return (req, res, next) => {
        const cookieValue = req.cookies[cookieName];
        if (!cookieValue) {
            return (
                res.status(401).json(
                    {
                        success: false,
                        message: "Authentication required"
                    }
                )
            )
        }

        try {
            const payload = validateToken(cookieValue);
            req.user = payload;
            return next();

        } catch (error) {
            return (
                res.status(401).json({
                    success: false,
                    message: error.message
                })
            )
        }
    }

}


module.exports =checkForAuthenticationCookieMiddelware;
