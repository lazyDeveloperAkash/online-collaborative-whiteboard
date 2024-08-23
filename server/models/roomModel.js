const mongoose = require("mongoose");

const roomModel = new mongoose.Schema({
    // creator: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'user'
    // },
    roomId: {
        type: String,
        required: true
    },
    // authorisedUser: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'user'
    // }],
    strokes: [{
        id: {
            type: String,
            required: true
        },
        tool: {
            type: String,
            enum: ["pencil", "eraser"],
            // default: "pencil"
        },
        color: {
            type: String,
            default: "#000000"
        },
        points: [
            {
                x: {
                    type: Number,
                    required: true
                },
                y: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
    ]

});

module.exports = mongoose.model("room", roomModel);