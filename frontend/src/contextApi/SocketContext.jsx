
import React, { createContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
export const SocketContext = createContext(null);


const SocketProvider = ({children}) => {
    const user = useSelector((state) => state.userReducer.currentUser);
    const socket = io("wss://streamx-8kxh.onrender.com", { transports: ["websocket"] });
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
        });
        socket.emit('join-room', user._id); 
        socket.on('video-upload',(data) => {
            console.log('Notification received:', data);
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

    },[socket])
    return (
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    )
}
export default SocketProvider;