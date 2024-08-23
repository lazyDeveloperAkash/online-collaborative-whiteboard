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
  const [userdata, setUserdata] = useState(user || null);
  const [clearCanvas, setClearCanvas] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    const callLoggedinUser = async () => {
      const callUser = await asyncloggedInUser();
      if (!callUser) {
        navigate('/');
        return;
      }
    }
    if (!user) {
      callLoggedinUser();
    }
    setUserdata(user);
  }, [user])

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

  const singOutHandler = async () => {
    const res = window.confirm("Do you want to signOut!");
    if (!res) return;
    const result = await asyncSignOut();
    if (result) navigate("/");
  }
  return (
    <div className='flex overflow-hidden relative'>
      <div className="w-[30vw] h-[100vh] pt-10 bg-slate-100">
        <div className="col">
          <h1 onClick={singOutHandler} className="text-center py-5 text-xl">
            {user && userdata?.name}
          </h1>
        </div>
        {isInARoom ? <RoomUsers roomId={roomId} setRoomId={setRoomId} setIsInARoom={setIsInARoom} setClearCanvas={setClearCanvas} /> :
          <JoinOrCreateRoom roomId={roomId} setRoomId={setRoomId} setIsInARoom={setIsInARoom} />
        }
      </div>
      <Whiteboard roomId={roomId} clearcanvas={clearCanvas} setClearCanvas={setClearCanvas} />
    </div>
  )
}

export default Dashboard