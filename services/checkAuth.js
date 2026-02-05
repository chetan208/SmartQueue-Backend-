import jwt from "jsonwebtoken";

function  checkAuth(req,res) {
        const cookieValue = req.cookies["token"];

        if (!cookieValue) {
            return res.json(
                    {
                        success: false,
                        message: "Authentication required"
                    }
            )
        }

        try {
            const payload =  jwt.verify(cookieValue, process.env.JWT_SECRET);
            return res.json({
            
                ...payload,
                success:true,
                message:"user logged in"
            
            })

        } catch (error) {
            return res.json(
                {
                    success: false,
                    message: error.message
                })
            
        }
    }

export default checkAuth