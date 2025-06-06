"use client";

import WhiteboardPalette from "@/components/ui/whiteboard/whiteboard-palette";
import Button from "@/components/ui/button";

import { useState, useRef, useEffect } from "react";
import { useWhiteboard } from "@/lib/whiteboard-context";

interface CanvasChange {
    type: "draw" | "other";
    startPoint: { x: number, y: number };
    payload: DrawPayload;
}

interface DrawPayload {
    points: { x: number, y: number }[];
    lineWidth: number;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    colorIndex: number;
    lineCap: CanvasLineCap;
}

export default function Whiteboard({ className }: { className: string }) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const { strokeStyle, setStrokeStyle, colorIndex, setColorIndex, lineWidth, setLineWidth, canvasRef, dbRef, setDbReady } = useWhiteboard();
    const startPointRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const pointsRef = useRef<{ x: number, y: number }[]>([]);

    // initial setup
    useEffect(() => {
        // canvas setup
        const canvas = canvasRef.current;
        if (!canvas) { return; }
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth;
        const context = canvas.getContext('2d')!
        if (!context) { return; }
        setCtx(context);

        // IDB setup
        const dbRequest = indexedDB.open("WhiteboardDB");
        dbRequest.onupgradeneeded = () => {
            dbRef.current = dbRequest.result;
            dbRef.current.createObjectStore("canvases", { keyPath: "id", autoIncrement: true });
        };

        // load saved canvas if it exists
        dbRequest.onsuccess = () => {
            dbRef.current = dbRequest.result;
            setDbReady(true);
            const tx = dbRequest.result.transaction("canvases", "readonly");
            const store = tx.objectStore("canvases");
            const count = store.count()
            count.onsuccess = () => {
                if (count.result == 0) {
                    return;
                }
                // replay changes
                const getAllRes = store.getAll();
                getAllRes.onsuccess = () => {
                    const changes = getAllRes.result;
                    for (let i = 0; i < count.result; i++) {
                        const change = changes[i];
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
                        // restore drawing mode from last change
                        if (i == count.result - 1) {
                            setStrokeStyle(change.payload.strokeStyle);
                            setColorIndex(change.payload.colorIndex);
                            setLineWidth(change.payload.lineWidth);
                        }
                    }
                }
            }
        }
        // TODO: create snapshot (async?) after every n strokes or after replaying changes and store in IDB
        //          then load snapshot next time page loads (and replay changes for first option)
    }, [setStrokeStyle, setColorIndex, setLineWidth, canvasRef, dbRef, setDbReady]);

    // update drawing mode on change
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error("couldn't get canvas reference");
            return;
        }
        const context = canvas.getContext('2d')
        if (!context) { return; }
        context.lineWidth = lineWidth;
        context.strokeStyle = strokeStyle;
        context.lineCap = 'round';
    }, [strokeStyle, lineWidth, canvasRef]);

    // drawing
    function startDrawing(e: React.MouseEvent) {
        if (!ctx) { return; }
        setIsDrawing(true);
        ctx.beginPath();
        const { offsetX, offsetY } = e.nativeEvent;
        ctx.moveTo(offsetX, offsetY);

        // store starting point and reset points
        startPointRef.current = { x: offsetX, y: offsetY };
        pointsRef.current = [];
    }
    function draw(e: React.MouseEvent) {
        if (!ctx) { return; }
        if (!isDrawing) { return; }
        const { offsetX, offsetY } = e.nativeEvent;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();

        // add point
        pointsRef.current.push({ x: offsetX, y: offsetY })
    }
    function endDrawing() {
        if (!ctx) { return; }
        if (!isDrawing) { return; }
        setIsDrawing(false);
        ctx.stroke();

        // save to IDB
        const change: CanvasChange = {
            type: "draw",
            startPoint: startPointRef.current,
            payload: {
                points: pointsRef.current,
                lineWidth: ctx.lineWidth,
                strokeStyle: ctx.strokeStyle,
                colorIndex: colorIndex,
                lineCap: ctx.lineCap
            }
        }
        if (dbRef.current) {
            const tx = dbRef.current.transaction("canvases", "readwrite");
            const store = tx.objectStore("canvases");
            store.put(change);
        }
    }

    // reset canvas
    function resetCanvas() {
        if (!canvasRef.current) { return; }
        const ctx = canvasRef.current.getContext('2d');

        if (!ctx) { return; }
        ctx.reset();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setStrokeStyle(ctx.strokeStyle);
        setColorIndex(0);
        setLineWidth(ctx.lineWidth);

        if (dbRef.current) {
            const tx = dbRef.current.transaction("canvases", "readwrite");
            const store = tx.objectStore("canvases");
            store.clear();
        }
    }

    // saving

    return (
        <div className={`flex flex-col items-center z-0 ${className}`}>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={endDrawing}
                onMouseMove={draw}
                onMouseLeave={endDrawing}
            >
            </canvas>
            <WhiteboardPalette />
            <div className="fixed bottom-2 left-2 flex flex-row space-x-2">
                <Button onClick={resetCanvas} className="">
                    Reset canvas
                </Button>
                {/* <Button onClick={downloadImage} className=""> */}
                {/*     Download Canvas as Image */}
                {/* </Button> */}
                {/* <Button onClick={downloadImage} className=""> */}
                {/*     Download Canvas as Image */}
                {/* </Button> */}
                {/* <Button onClick={downloadSnapshot} className=""> */}
                {/*     Download Canvas Data */}
                {/* </Button> */}
            </div>
        </div>
    );
}
