const express = require("express");
const router = express.Router();
const { isAuthenticate } = require("../middlewares/auth");
const { loggedinUser, signup, signin, signout, createRoom, uploadRoomId, getRoomData, deleteRoomData, strokeUpload } = require("../controllers/userController");

router.get('/', isAuthenticate, loggedinUser);
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);

router.post('/create-room', isAuthenticate, createRoom);
router.post('/upload-room-id', isAuthenticate, uploadRoomId);
router.post('/get-room-data', isAuthenticate, getRoomData);
router.post('/delet-room', isAuthenticate, deleteRoomData);
router.post('/stroke-upload', isAuthenticate, strokeUpload);


module.exports = router;