const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const roomModel = require("../models/roomModel");
const userModel = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const { sendToken } = require("../utils/sendToken");

exports.loggedinUser = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.id);
    res.status(200).json(user)
})

exports.signup = catchAsyncErrors(async (req, res, next) => {
    const user = await new userModel(req.body).save();
    sendToken(user, 201, res);
});

exports.signin = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel
        .findOne({ email: email })
        .select("+password");

    if (!user) {
        return next(
            new ErrorHandler(
                "User not found with this email address!"
            )
        );
    }
    const isMatch = user.comparePassword(password);
    if (!isMatch) return next(new ErrorHandler("Wrong Password", 500));
    sendToken(user, 201, res);
});

exports.signout = catchAsyncErrors(async (req, res, next) => {
    await userModel.findById(req.body.id);
    res.clearCookie("token");
    res.json({ message: "Successfully Singout!" });
});

exports.createRoom = catchAsyncErrors(async (req, res, next) => {
    const room = await new roomModel(req.body).save();
    if (!room) res.status(401).json({ message: "Something went wrong!" });
    await userModel.findByIdAndUpdate(req.id, { roomId: room.roomId });
    res.status(201).json(room);
});

exports.uploadRoomId = catchAsyncErrors(async (req, res, next) => {
    await userModel.findByIdAndUpdate(req.id, { roomId: req.body.roomId });
    res.status(200).json(true);
});

exports.getRoomData = catchAsyncErrors(async (req, res, next) => {
    const { roomId } = req.body;
    if (!roomId) return next(new ErrorHandler("Please provide room id!", 500));
    const room = await roomModel.findOne({ roomId: roomId });
    if (!room) res.status(401).json({ message: "Room data not available!" })
    res.status(201).json(room);
});

exports.deleteRoomData = catchAsyncErrors(async (req, res, next) => {
    const { roomId } = req.body;
    if (!roomId) return next(new ErrorHandler("Please provide room id!", 500));
    await userModel.updateMany({ roomId: roomId }, { $set: { roomId: "" } });
    const room = await roomModel.findOneAndDelete({ roomId: roomId });
    if (!room) res.status(401).json({ message: "Room data not available!" })
    res.status(201).json(true);
});

exports.strokeUpload = catchAsyncErrors(async (req, res, next) => {
    const { stroke } = req.body;
    const { roomId } = await userModel.findById(req.id);
    if (!roomId) return next(new ErrorHandler("Please provide room id!", 500));
    const room = await roomModel.findOne({ roomId: roomId });
    if (!room) res.status(401).json({ message: "Room data not available!" });
    room.strokes.push(stroke);
    await room.save();
    res.status(201).json(true);
});