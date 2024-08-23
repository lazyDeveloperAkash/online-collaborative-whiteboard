require('dotenv').config({ path: './.env' })
const express = require('express');
const app = express();

//database
require("./models/database").connectDatabase();

//logger creation
const logger = require('morgan');
app.use(logger('tiny'));

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//cors
const cors = require('cors');
app.use(cors({
    credentials: true,
    origin: true
}))

//session & paeser
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET
}))
app.use(cookieParser());

// Routes
app.use("/", require("./routes/userRoutes"));

//error handler
const ErrorHandler = require("./utils/errorHandler");
const { generatedeErrors } = require("./middlewares/error");
app.all("*", (req, res, next) => {
    next(new ErrorHandler(`requist url not found ${req.url}`, 404));
});
app.use(generatedeErrors);

//socket io 
const server = require('http').Server(app);
const io = require("./utils/socketApi")(server, { path: "/socket", serveClient: false });

// create server
server.listen(process.env.PORT, console.log(`server running on port ${process.env.PORT}`)) 