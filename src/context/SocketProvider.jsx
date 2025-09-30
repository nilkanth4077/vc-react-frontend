import React, { createContext, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const socketUrl = import.meta.env.VITE_BASE_URL;
    // console.log("Socket URL:", socketUrl);
    const socket = useMemo(() => io(socketUrl, { transports: ["websocket", "polling"] }), [socketUrl]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};