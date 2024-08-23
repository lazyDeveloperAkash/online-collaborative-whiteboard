import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contextApi/AuthContext';

const RoomUsers = ({ roomId,setRoomId , setIsInARoom, setClearCanvas }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { socket, asyncDeleteRoom,asyncUploadRoomId } = useContext(AuthContext);

  // useEffect(() => {
  //   socket.on("new-user", (name) => {
  //     setOnlineUsers((prev) => [...prev, name])
  //   })
  //   return () => {
  //     socket.off("new-user");
  //   }
  // }, [])

  const closeRoom = () => {
    roomId && socket.emit("close-room", roomId);
    setClearCanvas(true);
    setRoomId("");
    setIsInARoom(false);
    asyncUploadRoomId("");
  }

  const leaveRoom = ()=> {
    setClearCanvas(true);
    setRoomId("");
    setIsInARoom(false);
    asyncDeleteRoom();
  }

  return (
    <div className='flex flex-col items-center justify-between p-4'>
      <div>
        <h3 className='my-5'>Online Users : {onlineUsers.length}</h3>
        {/* {
          onlineUsers.map((name, idx) => (
            <div key={idx} className='w-full border border-black rounded-lg p-3'>
              <h4>{name || "name"}</h4>
            </div>
          ))
        } */}
      </div>
      <button onClick={leaveRoom}
        className="mt-1 block w-full p-2 border border-gray-300 text-white bg-red-400 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
      >Leave Room</button>
      <button onClick={closeRoom}
        className="mt-1 block w-full p-2 border border-gray-300 text-white bg-red-400 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
      >Close Room</button>
    </div>
  )
}

export default RoomUsers