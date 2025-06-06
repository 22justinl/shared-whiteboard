"use client";

import { useState, useContext, createContext } from "react";
import { Socket } from "socket.io-client";

type SessionContextType = {
    sessionActive: boolean;
    setSessionActive: React.Dispatch<boolean>;

    roomId: string;
    setRoomId: React.Dispatch<string>;

    memberNames: string[];
    setMemberNames: React.Dispatch<string[]>;

    socket: Socket | null;
    setSocket: React.Dispatch<Socket | null>;

    username: string;
    setUsername: React.Dispatch<string>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export default function SessionProvider({ children }: { children: React.ReactNode }) {
    const [sessionActive, setSessionActive] = useState(false);
    const [roomId, setRoomId] = useState("");
    const [memberNames, setMemberNames] = useState<string[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [username, setUsername] = useState<string>("user");

    return (
        <SessionContext.Provider value={{ sessionActive, setSessionActive, roomId, setRoomId, memberNames, setMemberNames, socket, setSocket, username, setUsername}}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used inside SessionProvider");
    }
    return context;
}
