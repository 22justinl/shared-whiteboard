"use client";

import LinkButton from "@/components/ui/link-button";
import Button from "@/components/ui/button";
import Menu from "@/components/ui/whiteboard/menu";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [shareOpen, setShareOpen] = useState(false);
    const [sessionActive, setSessionActive] = useState(false);
    const [roomId, setRoomId] = useState("");
    const [copied, setCopied] = useState(false);
    const [memberTabOpen, setMemberTabOpen] = useState(false);
    const [memberNames, setMemberNames] = useState<string[]>(["a","b","c","d"]);
    const [sio, setSio] = useState<Socket|null>(null);
    const [username, setUsername] = useState("");

    const backendURL = "http://127.0.0.1:8000";

    function openShareMenu() {
        setShareOpen(true)
        setCopied(false);
    }
    function closeShareMenu() {
        setShareOpen(false)
    }

    useEffect(() => {
        if (sio) { return; }
        const hash = window.location.hash;
        if (hash.startsWith("#room=")) {
            const [, id] = hash.split("=");
            console.log(`attempt to join ${id}`);
            setRoomId(id);
            setSessionActive(true);

            const socket = io(backendURL, { withCredentials: true, transports: ["websocket"] });
            if (!socket) { console.log("couldn't create socket"); return; }
            setSio(socket);

            socket.on("connect", () => {
                console.log(`join room ${id}`);
                socket.emit("join_room", id);
            });
            socket.on("member_list_change", (new_list) => {
                setMemberNames(new_list);
            });
        }
    }, [roomId, sio]);
    useEffect(() => {
        if (sio) {
            sio.emit("set_username", username, roomId);
        }
    }, [username, roomId, sio]);
    useEffect(() => {
        const temp = localStorage.getItem('username');
        if (temp) {
            setUsername(temp);
        } else {
            setUsername("user");
        }
    }, []);

    function startSession() {
        const socket = io(backendURL, { withCredentials: true, transports: ["websocket"] });
        if (!socket) { console.log("couldn't create socket"); return; }
        setSio(socket);
        socket.on("connect", () => {
            socket.emit("create_room", (val: string) => {
                setRoomId(val);
                window.location.hash = `room=${val}`;
            });
        });
        socket.on("member_list_change", (new_list) => {
            setMemberNames(new_list);
        });
        setSessionActive(true);
    }
    function endSession() {
        if (sio) {
            sio.disconnect();
        }
        history.pushState("", document.title, window.location.pathname);
        setSio(null);
        setSessionActive(false);
        setMemberTabOpen(false);
    }
    function handleUsernameField(e: React.FocusEvent<HTMLInputElement>) {
        let new_username = e.currentTarget.value;
        if (new_username.length == 0) {
            e.currentTarget.value = username;
            return;
        }
        if (new_username.length > 20) {
            e.currentTarget.value = new_username.substring(0, 20);
            new_username = e.currentTarget.value;
        }
        if (new_username == username) {
            console.log("no change");
            return;
        }
        console.log(`new username ${new_username}`);
        setUsername(new_username);
        localStorage.setItem('username', new_username);
    }

    return (
        <div className="flex flex-col">
            <div className="top-0 left-0 flex flex-row z-10">
                <Menu className="m-2" />{/*icon*/}
                <Button className="m-2" onClick={openShareMenu}>
                    Share
                </Button>
                <LinkButton text="Home" link="/" className="m-2" />
                {/*share popup*/}
                {shareOpen &&
                    <div className="fixed top-0 left-0 z-50 size-full flex items-center justify-center">

                        {/*gray*/}
                        <div className="fixed top-0 left-0 size-full bg-gray-900 opacity-50" onClick={closeShareMenu}>
                        </div>

                        {/*panel*/}
                        <div className="fixed min-w-135 bg-white border border-black rounded-md py-3 px-2 space-y-2">
                            {/*header*/}
                            <div className="flex w-full justify-end items-center mb-3 content-center">
                                <h1 className="text-3xl w-full text-center">
                                    Share
                                </h1>
                                <button className="fixed hover:bg-gray-200 size-5" onClick={closeShareMenu}>
                                    X
                                </button>
                            </div>
                            <div className="flex align-middle w-full justify-center items-center">
                                <input
                                className="border border-black rounded-md p-1 w-full h-10" defaultValue={username} onBlur={(e)=>handleUsernameField(e)}/>
                            </div>
                            <div className="flex align-middle w-full justify-center items-center">
                                {
                                    !sessionActive ?
                                        <Button onClick={startSession} className="">
                                            start session
                                        </Button>
                                        :
                                        <div className="flex flex-col space-y-2 w-full justify-center items-center">
                                            <div className="flex flex-row w-full items-center justify-center space-x-2 p-2">
                                                <input disabled value={`${window.location.origin}/whiteboard#room=${roomId}`} className="border border-black rounded-md p-1 w-full h-10">
                                                </input>
                                                <button className={`border border-black rounded-md h-10 w-30 p-1 transition-colors
                                                ${!copied ? "bg-white hover:bg-gray-200" : "bg-green-500 hover:bg-green-600"}`}
                                                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/whiteboard#room=${roomId}`); setCopied(true) }}>
                                                    {!copied ? "Copy Link" : "Copied!"}
                                                </button>
                                            </div>
                                            <Button onClick={endSession}>
                                                end session
                                            </Button>
                                        </div>
                                }
                            </div>
                        </div>
                    </div>
                }
                <div>
                    <Button className={`m-2 ${sessionActive ? '' : 'hidden'}`}
                        onClick={() => setMemberTabOpen(!memberTabOpen)}>
                        members
                    </Button>
                    <div className={`absolute top-0 bg-white flex flex-col text-black border rounded-r-lg space-x-6 px-5 py-5 justify-start transition-all ${memberTabOpen && sessionActive ? 'left-0': '-left-50'}`}>
                        <h1>Members</h1>
                        <ul>
                        {memberNames.map((memberName, i)=>{
                            return (
                                <li key={i}>{memberName}</li>
                            );
                        })}
                        </ul>
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
}
