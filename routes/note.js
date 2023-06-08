require("dotenv").config();
const express = require("express");
const { body, validationResult } = require("express-validator");
const getEmailByToken = require("../middleware/getEmail");
const prismaClient = require("@prisma/client");

// Initialize the router.
const router = express.Router();

// Initialize the prisma client.
const prisma = new prismaClient.PrismaClient();

// API Route: /api/note/addnote
// Method: POST
// Function: Adds a new note in the logged-in user dashboard.

router.post(
    "/addnote",
    body("title", "Please enter note title!").isLength({ min: 1 }),
    body("content", "Please enter note content!").isLength({ min: 1 }),
    getEmailByToken,
    async (req, res) => {
        // Finds the validation errors in this request and return any error message.
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(403).json({ data: errors.array()[0].msg });
        }

        // Get the request details.
        const {
            body: { title, content },
            email,
        } = req;

        try {
            // Get the user ID from the email.
            const user = await prisma.users.findUnique({
                where: {
                    email,
                },
                select: {
                    id: true,
                },
            });

            if (!user) {
                return res.status(404).json({ data: "User does not exists!" });
            }

            // Create the unique slug.
            const ms = Date.now();
            const slug = `${title}-${ms}`;

            // Construct Note data.
            const noteData = {
                slug,
                title,
                content,
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            };

            // Add the new note into the database.
            await prisma.notes.create({ data: noteData });

            // Send the response.
            return res
                .status(200)
                .json({ data: "Your note saved successfully." });
        } catch (error) {
            return res.status(500).json({ data: error.message });
        }
    }
);

// API Route: /api/note/allnotes
// Method: GET
// Function: Fetches all the saved notes from database to the logged-in user dashboard.

router.get("/allnotes", getEmailByToken, async (req, res) => {
    try {
        // Get the user ID from the email.
        const user = await prisma.users.findUnique({
            where: {
                email: req.email,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            return res.status(404).json({ data: "User does not exists!" });
        }

        // Fetches all the notes from the user id.
        const allNotes = await prisma.notes.findMany({
            select: {
                slug: true,
                title: true,
                content: true,
            },
            where: {
                userID: user.id,
            },
        });

        // Send the notes as response.
        return res.status(200).json({ data: allNotes });
    } catch (error) {
        return res.status(500).json({ data: error.message });
    }
});

module.exports = router;
