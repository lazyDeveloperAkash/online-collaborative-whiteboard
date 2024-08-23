const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const userModel = new mongoose.Schema({
    name: {
        type: String,
        requared: [true, "Name is Required"],
        minLength: [3, "Name Contain atleast 3 character"],
        maxLength: [20, "Name Contain atleast 20 character"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
    },
    password: {
        type: String,
        select: false,
        maxLength: [15, "Password should not exceed more than 15 characters"],
        minLength: [5, "Password should have atleast less than 5 characters"]
        // match[]
    },
    roomId: {
        type: String,
        default: ""
    }

});

userModel.pre("save", function () {
    if (!this.isModified("password")) return;
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
})

userModel.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

userModel.methods.getJWTToken = function () {
    return JWT.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

module.exports = mongoose.model("user", userModel);