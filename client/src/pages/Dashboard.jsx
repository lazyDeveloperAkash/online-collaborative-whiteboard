import React, { useContext, useEffect, useState } from 'react'
import JoinOrCreateRoom from '../components/JoinOrCreateRoom'
import { AuthContext } from '../contextApi/AuthContext';
import Whiteboard from '../components/WhieBoard';
import { useNavigate } from 'react-router-dom';
import RoomUsers from '../components/RoomUsers';

const Dashboard = () => {
  const { user, socket, asyncSignOut, asyncloggedInUser, asyncDeleteRoom } = useContext(AuthContext);
  const [roomId, setRoomId] = useState();
  const [isInARoom, setIsInARoom] = useState(false);
  const [clearCanvas, setClearCanvas] = useState(false)

  useEffect(() => {
    if (!user) return;
    if (user.roomId != "") socket.emit("is-room-exist", user.roomId);

    socket.on("room-exist-status", ({ status, room_id }) => {
      if (status) {
        setIsInARoom(true);
        setRoomId(user.roomId)
      } else {
        if (user && user.roomId) asyncDeleteRoom(room_id);
      }
    })
    return () => {
      socket.off("room-exist-status");
    }
  }, [user])

  useEffect(() => {
    socket.on("room-closed", () => {
      setRoomId("");
      setIsInARoom(false);
    })

    return () => {
      socket.off("room-closed");
    }
  }, [])

  return (
    <div className='flex overflow-hidden relative'>
      <Whiteboard user={user} roomId={roomId} clearcanvas={clearCanvas} setRoomId={setRoomId} isInARoom={isInARoom} setIsInARoom={setIsInARoom} setClearCanvas={setClearCanvas} />
    </div>
  )
}

export default Dashboard