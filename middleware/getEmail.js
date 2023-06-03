require("dotenv").config();
var jwt = require("jsonwebtoken");

// Get the secret key.
const secretKey = process.env.JWT_SECRET_KEY;

// This function get the email from the JWT token passed in request header.

const getEmailByToken = (req, res, next) => {
    // Get the Bearer Token.
    const bearerToken = req.header("Authorization");

    if (!bearerToken) {
        return res.status(401).json({ data: "Unauthorized Access Request!" });
    }

    // Extract the JWT from bearer token.
    const authToken = bearerToken.split(" ")[1];

    if (!authToken) {
        return res.status(401).json({ data: "Unauthorized Access Request!" });
    }

    try {
        // Verify the JWT.
        let payLoad = jwt.verify(authToken, secretKey);

        // Extract the email.
        req.email = payLoad.data;

        // Perform the next processing.
        next();
    } catch (err) {
        // console.log(err.message);
        return res.status(500).json({ data: err.message });
    }
};

module.exports = getEmailByToken;
