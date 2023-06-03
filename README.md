# CloudNote - BackEnd

CloudNote is a secure, cloud-based Note keeping application. User can Sign Up/Log in with the email and password. User can add/edit/delete their notes in this application. The Application is built on MERN stack (MongoDB Atlas, Next JS, Express JS). It uses **password hash-encryption** to protect user passwords, **JWT tokens** for user authentication and **React Context API** for session management. All the data stored in MongoDB Atlas on Cloud so that user data is available everywhere. The Backend server used **REST API** for data handling.

This repository is the backend portion of the CloudNote application. The backend of the application is the REST API routes developed in Node JS framework - Express JS.

**MongoDB Atlas** is used as backend database. **Prisma** is used as ORM (Object Relationship Model) to connect to the MongoDB Atlas.

## Environment Variables

-   PORT: Port number of the backend application to listen.
-   JWT_SECRET_KEY: Secret key used for creating JSON Web Token.
-   DATABASE_URL: MongoDB URL to connect.
