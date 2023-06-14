# CloudNote - BackEnd

CloudNote is a secure, cloud-based Note keeping application. User can Sign Up/Log in with the email and password. User can add/fetch/edit/delete their notes on the application dashboard. The Application is built on **MERN stack (MongoDB Atlas, Next JS, Express JS)**. It uses **password hash-encryption** to protect user passwords, **JWT tokens** for user authentication and **React Context API** for session management. All the data stored in MongoDB Atlas on Cloud so that user data is available everywhere. The Backend server used **REST API** for data handling.

This repository is the backend portion of the CloudNote application. The backend of the application is the REST API routes developed in Node JS framework - **Express JS**.

**MongoDB Atlas** is used as backend database. **Prisma** is used as ORM (Object Relationship Model) to connect to the MongoDB Atlas.

## Environment Variables

-   **PORT:** Port number of the backend application to listen.
-   **JWT_SECRET_KEY:** Secret key used for creating JSON Web Token.
-   **DATABASE_URL:** MongoDB URL to connect.

## API Routes:

### Authentication Routes

-   **/api/auth/signup:** Adds a new user into the database. Method: _POST_.
-   **/api/auth/login:** Enables login of a user with email and password as input request data. Method: _POST_.

### Note Routes (CRUD operations)

-   **/api/note/notes:** Fetches all the saved notes from database to the logged-in user dashboard. Method: _GET_.
-   **/api/note:** Adds a new note in the logged-in user dashboard. Method: _POST_. Authentication header is required with bearer JWT.
-   **/api/note/:slug:** Deletes the note specified by the slug by the logged-in user. Method: _DELETE_. Authentication header is required with bearer JWT.
-   **/api/note/:slug:** Updates the content and title of the note specified by the slug by the logged-in user. Method: _PUT_. Authentication header is required with bearer JWT.

## Production Hosting URL

The REST API is roasted on the following URL:

> **https://cloudnote-backend-api.onrender.com**

## Test URL

> **http://localhost:3001/**
