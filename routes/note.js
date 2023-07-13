require("dotenv").config();
const express = require("express");
const { body, validationResult } = require("express-validator");
const getEmailByToken = require("../middleware/getEmail");
const prismaClient = require("@prisma/client");

// Initialize the router.
const router = express.Router();

// Initialize the prisma client.
const prisma = new prismaClient.PrismaClient();

// API Route: /api/note
// Method: POST
// Function: Adds a new note in the logged-in user dashboard.

router.post(
    "/",
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

        // Create the unique slug.
        const ms = Date.now();
        const slug = `${title}-${ms}`;

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

// API Route: /api/note/notes
// Method: GET
// Function: Fetches all the saved notes for the logged in user to the user dashboard.

router.get("/notes", getEmailByToken, async (req, res) => {
    // Get the user email.
    const { email } = req;

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

        // Fetches all the notes from the user id.
        const allNotes = await prisma.notes.findMany({
            select: {
                slug: true,
                title: true,
                content: true,
                updatedAt: true,
            },
            where: {
                userID: user.id,
            },
        });

        // Sort the notes by the updatedAt, with recent stories come first.
        allNotes.sort((s1, s2) => {
            // Convert the updatedAt timestamps to milliseconds.
            const ms1 = Date.parse(s1.updatedAt);
            const ms2 = Date.parse(s2.updatedAt);

            // Compare the milliseconds. Sorts the notes with recent updates come first.
            if (ms1 < ms2) {
                return 1;
            } else if (ms1 > ms2) {
                return -1;
            } else {
                return 0;
            }
        });

        // Send the notes as response.
        return res.status(200).json({ data: allNotes });
    } catch (error) {
        return res.status(500).json({ data: error.message });
    }
});

// API Route: /api/note/[slug]
// Method: DELETE
// Function: Deletes the note specified by the slug by the logged-in user.

router.delete("/:slug", getEmailByToken, async (req, res) => {
    // Get the request parameter and user email.
    const {
        email,
        params: { slug },
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

        // Get the existing note from the database.
        const currNote = await prisma.notes.findUnique({
            where: {
                slug,
            },
            select: {
                id: true,
                userID: true,
            },
        });

        if (!currNote) {
            return res.status(404).json({ data: "Note does not exists!" });
        }

        // Check the user owns the note or not.
        if (currNote.userID !== user.id) {
            return res
                .status(401)
                .json({ data: "Unauthorized Access Request!" });
        }

        // Delete the note with given note id.
        await prisma.notes.delete({
            where: {
                id: currNote.id,
            },
        });

        // Send the response.
        return res.status(200).json({ data: "Note deleted successfully." });
    } catch (error) {
        return res.status(500).json({ data: error.message });
    }
});

// API Route: /api/note/[slug]
// Method: PUT
// Function: Updates the content and title of the note specified by the slug by the logged-in user.

router.put("/:slug", getEmailByToken, async (req, res) => {
    // Get the request parameter and user email.
    const {
        email,
        params: { slug },
        body: { title, content },
    } = req;

    // Create the updated note data object.
    let data = {};

    if (title) {
        data.title = title;
        // Create the unique slug.
        const ms = Date.now();
        data.slug = `${title}-${ms}`;
    }

    if (content) {
        data.content = content;
    }

    if (!data.title && !data.content) {
        return res.status(404).json({ data: "No data to update!" });
    }

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

        // Get the existing note from the database.
        const currNote = await prisma.notes.findUnique({
            where: {
                slug,
            },
            select: {
                id: true,
                userID: true,
            },
        });

        if (!currNote) {
            return res.status(404).json({ data: "Note does not exists!" });
        }

        // Check the user owns the note or not.
        if (currNote.userID !== user.id) {
            return res
                .status(401)
                .json({ data: "Unauthorized Access Request!" });
        }

        // Update the current note by input values.
        const newNote = await prisma.notes.update({
            where: {
                id: currNote.id,
            },
            data,
        });

        // Send the response.
        return res.status(200).json({ data: "Note updated successfully." });
    } catch (error) {
        return res.status(500).json({ data: error.message });
    }
});

module.exports = router;
