require("dotenv").config();
const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const getEmailByToken = require("../middleware/getEmail");
const prismaClient = require("@prisma/client");

// Initialize the prisma client.
const prisma = new prismaClient.PrismaClient();

// Get the secret key.
const secretKey = process.env.JWT_SECRET_KEY;

// Generate salt for hashing.
const salt = bcrypt.genSaltSync(10);

// Initialize the router.
const router = express.Router();

// API Route: /api/auth/signup
// Method: POST
// Function: Adds a new user into the database.
router.post(
    "/signup",
    body("name", "Name is required!").isLength({ min: 1 }),
    body("gender", "Please provide your sex.").isIn(["M", "F", "O"]),
    body("birthDate", "Please enter your Date for Birth.").isDate(),
    body("email", "Your email is required.").isEmail(),
    body("password", "Please use a strong password!").isStrongPassword(),
    async (req, res) => {
        // Finds the validation errors in this request and return any error message.
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(403).json({ data: errors.array()[0].msg });
        }

        // Get the request email and password from the request body.
        const { email, password } = req.body;

        try {
            // Check if there is any user with same email id in the database. In that case show error.
            const user = await prisma.users.findUnique({
                where: {
                    email,
                },
            });

            if (user) {
                return res
                    .status(409)
                    .json({ data: "User is already exists." });
            }

            // Hash the password with the salt.
            const hash = bcrypt.hashSync(password, salt);
            req.body.password = hash;

            // Create the user in database.
            await prisma.users.create({ data: req.body });

            // Send the success response.
            return res
                .status(200)
                .json({ data: "User is created successfully." });
        } catch (error) {
            return res.status(500).json({ data: error.message });
        }
    }
);

// API Route: /api/auth/login
// Method: POST
// Function: Enables login of a user with email and password as input request data.

router.post(
    "/login",
    body("email", "Please enter a valid email.").isEmail(),
    body("password", "Please enter your password properly").isLength({
        min: 1,
    }),
    async (req, res) => {
        // Finds the validation errors in this request and return any error message.
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(403).json({ data: errors.array()[0].msg });
        }

        // Get the request email and password from the request body.
        const { email, password } = req.body;

        try {
            // Check if the user email already exists or not.
            const user = await prisma.users.findUnique({
                where: {
                    email,
                },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    name: true,
                    gender: true,
                    birthDate: true,
                },
            });

            // If there is no user with the email, show error.
            if (!user) {
                return res
                    .status(401)
                    .json({ data: "You are NOT authenticated." });
            }

            // Compare the password hash from DB with the user input password. If not matching, show error.
            const match = bcrypt.compareSync(password, user.password);

            if (!match) {
                return res
                    .status(401)
                    .json({ data: "You are NOT authenticated." });
            }

            // Create the JSON Web Token using email.
            const JWToken = jwt.sign(
                {
                    data: email,
                },
                secretKey,
                { expiresIn: "1h" }
            );

            // Create the user details.
            const userdetails = {
                name: user.name,
                email: user.email,
                gender: user.gender,
                birthDate: user.birthDate,
                accessToken: JWToken,
            };

            // Send the JSON Web token as response.
            return res.status(200).json({ data: { ...userdetails } });
        } catch (error) {
            return res.status(500).json({ data: error.message });
        }
    }
);

module.exports = router;
