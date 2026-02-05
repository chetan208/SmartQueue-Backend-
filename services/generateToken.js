import jwt from 'jsonwebtoken';

const generateTokenForUser = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return token;
}

const generateTokenForHospital = (hospital) => {
    const payload = {
        id: hospital._id,
        email: hospital.email,
        name: hospital.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return token;
}

export { generateTokenForUser, generateTokenForHospital };