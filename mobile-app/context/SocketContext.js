/**
 * ════════════════════════════════════════════
 * context/SocketContext.js — REAL-TIME STATE
 * ════════════════════════════════════════════
 *
 * WHY SEPARATE FROM AuthContext?
 * - Socket is a separate concern (networking)
 * - Socket connects only when user is logged in
 * - Easier to reconnect/disconnect independently
 */

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "../services/api";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Connect to socket server when user logs in
      const newSocket = io(BASE_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        newSocket.emit("userOnline", user._id);
      });

      newSocket.on("onlineUsers", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      // Disconnect when user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};
