import React, { createContext, useEffect, useMemo, useState } from 'react';
import Axios from '../utills/Axios'
import { toast } from 'react-toastify'
import socketIo from 'socket.io-client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    const ENDPOINT = 'http://localhost:4040';
    const socket = useMemo(() => socketIo(ENDPOINT, { path: '/socket', transports: ['websocket'] }), []);

    const asyncSignUp = async (userData) => {
        setIsLoading(!isLoading);
        try {
            const { data } = await Axios.post('/signup', userData);
            setUser(data.user);
            if (data) toast.success("Singup Succesfull");
            return true;
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const asyncloggedInUser = async () => {
        if(user) return;
        try {
            const { data } = await Axios.get('/');
            setUser(data);
            return data;
        } catch (error) {
            return false;
        }
    }

    const asyncSingIn = async (userData) => {
        setIsLoading(!isLoading);
        try {
            const { data } = await Axios.post('/signin', userData);
            setUser(data.user);
            if (data) toast.success("Singin Succesfull");
            return true;
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message);
            return false;
        } finally {
            setIsLoading(!isLoading);
        }
    };

    const asyncSignOut = async () => {
        setIsLoading(true);
        try {
            const { data } = await Axios.post('/signout');
            setUser(null);
            if (data) toast.warn("Singout Succesfull");
            return true;
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const asyncCreateRoom = async (roomId) => {
        setIsLoading(true);
        try {
            const { data } = await Axios.post('/create-room', { roomId });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const asyncUploadRoomId = async (roomId) => {
        setIsLoading(true);
        try {
            const { data } = await Axios.post('/upload-room-id', { roomId: roomId });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const asyncGetRoomData = async () => {
        try {
            const { data } = await Axios.post('/get-room-data', { roomId: user.roomId });
            return data;
        } catch (error) {
            console.log(error);
        }
    };

    const asyncDeleteRoom = async () => {
        try {
            const { data } = await Axios.post('/delet-room', { roomId: user.roomId });
        } catch (error) {
            console.log(error);
        }
    };

    const asyncStrokeUpload = async (stroke) => {
        console.log(user.roomId)
        try {
            await Axios.post('/stroke-upload', {stroke: stroke});
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <AuthContext.Provider value={{
            socket,
            user,
            isLoading,
            asyncloggedInUser,
            asyncSignUp,
            asyncSingIn,
            asyncSignOut,
            asyncStrokeUpload,
            asyncDeleteRoom,
            asyncGetRoomData,
            asyncUploadRoomId,
            asyncCreateRoom,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
