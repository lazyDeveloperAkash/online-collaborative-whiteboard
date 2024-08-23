const JWT = require("jsonwebtoken");
const errorHandler = require("../utils/errorHandler");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");

exports.isAuthenticate = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) return new errorHandler("Please Login to access the resourse!", 401);
    const { id } = JWT.verify(token, process.env.JWT_SECRET);
    if (!id) return next(new errorHandler("Unathorized or Invalid Token!", 401))
    req.id = id;
    next();
})