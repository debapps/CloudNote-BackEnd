require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Initializing express application.
const app = express();

// Middleware.
app.use(express.json());
app.use(cors());

// Available Routes.
// app.use("/api/note", require("./routes/notes"));
app.use("/api/auth", require("./routes/auth"));

// Listening to the application port.
const port = process.env.PORT;

app.listen(port, (err) => {
    if (!err) {
        console.log(`The CloudNote App is up at port: ${port}`);
    }
});
