import React, { useContext, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { AuthContext } from "../contextApi/AuthContext";
import { v4 as uuid } from 'uuid';

const JoinOrCreateRoom = ({ roomId, setRoomId, setIsInARoom }) => {
    const [joinRoomId, setJoinRoomId] = useState("");
    const { socket, user, asyncCreateRoom, asyncUploadRoomId } = useContext(AuthContext);

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        socket.emit("join-room", { roomId: roomId, name: user.name || "asdf" });
        setIsInARoom(true);
        asyncCreateRoom(roomId);
    };
    const handleJoinSubmit = (e) => {
        e.preventDefault();
        socket.emit('join-room', { roomId: joinRoomId, name: user.name || "sadf" });
        setRoomId(joinRoomId);
        setIsInARoom(true);
        asyncUploadRoomId(joinRoomId);
    };

    return (
        <div className="mx-5 mt-5">
            <div className="col-md-5 p-5 border rounded-xl mx-auto bg-white">
                <h1 className="text-center text-primary mb-5">Create Room</h1>
                <form onSubmit={handleCreateSubmit}>
                    <div className="flex flex-col my-2 border items-center rounded-xl p-3">
                        <input
                            type="text"
                            className="text-center w-full border-0 outline-0"
                            value={roomId}
                            readOnly={true}
                        />
                        <div className="flex justify-center gap-6">
                            <button
                                className="border-0 text-indigo-600"
                                type="button"
                                onClick={() => setRoomId(uuid())}
                            >
                                Generate
                            </button>
                            <CopyToClipboard
                                text={roomId}
                                onCopy={() => toast.success("Room Id Copied To Clipboard!")}
                            >
                                <button
                                    type="button"
                                >
                                    Copy
                                </button>
                            </CopyToClipboard>
                        </div>
                    </div>
                    <div className="mt-5">
                        <button
                            type="submit"
                            disabled={joinRoomId}
                            className={`${joinRoomId ? "bg-slate-400 cursor-not-allowed hover:bg-slate-400" : ""} w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                        >
                            Create Room
                        </button>
                    </div>
                </form>
            </div>
            <div className="p-5 border mx-auto bg-white rounded-xl mt-6">
                <h1 className="text-center text-primary mb-5">Join Room</h1>
                <form onSubmit={handleJoinSubmit} className="flex flex-col items-center">
                    <div className="my-2">
                        <input
                            name="room-id"
                            type="text"
                            placeholder="Room Id"
                            onChange={(e) => setJoinRoomId(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="mt-5">
                        <button type="submit"
                            className="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Join Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinOrCreateRoom;