"use client";

import Button from "@/components/ui/button";
import { io, Socket } from "socket.io-client";

import { useState, useEffect, useCallback } from "react";

import { useSession } from "@/lib/session-context";
import { useWhiteboard } from "@/lib/whiteboard-context";

import { CanvasChange } from "@/types/canvas-types";

export default function ShareMenu() {
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const { sessionActive, setSessionActive, roomId, setRoomId, setMemberNames, socket, setSocket, username, setUsername } = useSession();
    const { setStrokeStyle, setColorIndex, setLineWidth, canvasRef, dbRef } = useWhiteboard();

    function openShareMenu() {
        setShareOpen(true)
        setCopied(false);
    }
    function closeShareMenu() {
        setShareOpen(false)
    }

    const addEventsToSocket = useCallback((s: Socket) => {
        s.on("member_list_change", (new_list: string[]) => {
            setMemberNames(new_list);
        });
        s.on("drawing_changed", ({ change }) => {
            if (!canvasRef.current) { return; }
            const context = canvasRef.current.getContext('2d');
            if (!context) { return; }
            applyChange(change, context);
        });
        s.on("reset_drawing", () => {
            if (!canvasRef.current) { return; }
            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) { return; }
            ctx.reset();
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // if (dbRef.current) {
            //     const tx = dbRef.current.transaction("canvases", "readwrite");
            //     const store = tx.objectStore("canvases");
            //     store.clear();
            // }
        });
    }, [canvasRef, setMemberNames]);

    const backendURL = `${process.env.NEXT_PUBLIC_API_URL}`;
    useEffect(() => {
        if (socket) { return; }
        const hash = window.location.hash;
        if (hash.startsWith("#room=")) {
            const [, id] = hash.split("=");
            setRoomId(id);

            const socket = io(backendURL, { withCredentials: true, transports: ["websocket"] });
            if (!socket) { console.log("couldn't create socket"); return; }
            setSocket(socket);
            setSessionActive(true);

            socket.on("connect", () => {
                socket.emit("join_room", id, ({ drawing_data }: { drawing_data: string }) => {
                    if (drawing_data) {
                        if (!canvasRef.current) { return; }
                        const context = canvasRef.current.getContext('2d');
                        if (!context) { return; }
                        const data = JSON.parse(drawing_data);
                        for (let i = 0; i < data.length; i++) {
                            const change = data[i];
                            applyChange(change, context);
                            // restore drawing mode from last change
                            if (i == data.length - 1) {
                                setStrokeStyle(change.payload.strokeStyle);
                                setColorIndex(change.payload.colorIndex);
                                setLineWidth(change.payload.lineWidth);
                            }
                        }
                    }
                });
            });
            addEventsToSocket(socket);
        }
    }, [roomId, socket, backendURL, setMemberNames, setRoomId, setSessionActive, setSocket, canvasRef, setColorIndex, setLineWidth, setStrokeStyle, addEventsToSocket]);
    function applyChange(change: CanvasChange, context: CanvasRenderingContext2D) {
        if (change.type == "draw") {
            context.lineWidth = change.payload.lineWidth;
            context.strokeStyle = change.payload.strokeStyle;
            context.lineCap = change.payload.lineCap;

            context.beginPath();
            context.moveTo(change.startPoint.x, change.startPoint.y);
            const points = change.payload.points;
            for (let j = 0; j < points.length; j++) {
                context.lineTo(points[j].x, points[j].y);
                context.stroke();
            }
        }
    }

    useEffect(() => {
        if (socket) {
            socket.emit("set_username", username, roomId);
        }
    }, [username, roomId, socket]);
    useEffect(() => {
        const temp = localStorage.getItem('username');
        if (temp) {
            setUsername(temp);
        } else {
            setUsername("user");
        }
    }, [setUsername]);
    function startSession() {
        const s = io(backendURL, { withCredentials: true, transports: ["websocket"] });
        if (!s) { console.log("couldn't create socket"); return; }
        setSocket(s);
        setSessionActive(true);
        s.on("connect", () => {
            if (dbRef.current) {
                const tx = dbRef.current.transaction("canvases", "readonly");
                const store = tx.objectStore("canvases");
                const getAllRequest = store.getAll();
                getAllRequest.onsuccess = () => {
                    const data = JSON.stringify(getAllRequest.result);
                    s.emit("create_room_and_join", { drawing_data: data }, (val: string) => {
                        setRoomId(val);
                        window.location.hash = `room=${val}`;
                    });
                }
            } else {
                s.emit("create_room_and_join", {}, (val: string) => {
                    setRoomId(val);
                    window.location.hash = `room=${val}`;
                });
            }
        });
        addEventsToSocket(s);
    }
    function endSession() {
        if (socket) {
            socket.disconnect();
        }

        // remove # from URL
        history.pushState("", document.title, window.location.pathname);

        setSocket(null);
        setSessionActive(false);
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
            return;
        }
        setUsername(new_username);
        localStorage.setItem('username', new_username);
    }

    return (
        <div>
            <Button className="m-2" onClick={openShareMenu}>
                Share
            </Button>
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
                        <div className="flex align-middle w-full justify-center items-center space-x-2">
                            <h1>
                                Username
                            </h1>
                            <input
                                className="border border-black rounded-md p-1 w-full h-10" defaultValue={username} onBlur={(e) => handleUsernameField(e)} />
                        </div>
                        <div className="flex align-middle w-full justify-center items-center">
                            {
                                !sessionActive ?
                                    <Button onClick={startSession} className="">
                                        start session
                                    </Button>
                                    :
                                    <div className="flex flex-col space-y-2 w-full justify-center items-center">
                                        <div className="flex flex-row w-full items-center space-x-2 justify-between">
                                            {!sessionActive ?
                                                <div>Creating session...</div>
                                                :
                                                <div className="w-full flex justify-between space-x-2">
                                                    <input disabled value={`${window.location.origin}/whiteboard#room=${roomId}`} className="border border-black rounded-md w-full h-10 p-2">
                                                    </input>
                                                    <button
                                                        className={`border border-black rounded-md h-10 w-30 transition-colors ${!copied ? "bg-white hover:bg-gray-200" : "bg-green-500 hover:bg-green-600"}`}
                                                        onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/whiteboard#room=${roomId}`); setCopied(true); }}>
                                                        {!copied ? "Copy Link" : "Copied!"}
                                                    </button>
                                                </div>
                                            }
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
        </div>
    );
};
