"use-client";

import { useState, useRef, useEffect } from "react";
import { useWhiteboard } from "@/lib/whiteboard-context";

export default function WhiteboardPalette({ className } : {className?: string}) {
    const paletteRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [pos, setPos] = useState({x:50,y:50});
    const [offset, setOffset] = useState({x:0,y:0});
    const {lineWidth, setLineWidth, setStrokeStyle, colorIndex, setColorIndex} = useWhiteboard();

    // position
    useEffect(() => {
        setPos({x: window.innerWidth/2, y: window.innerHeight/2});
    },[])

    // dragging
    const startDragging = (e: React.MouseEvent) => {
        setIsDragging(true);
        setOffset({x: e.clientX - pos.x, y: e.clientY - pos.y});
    }
    useEffect(() => {
        const drag = (e: MouseEvent) => {
            if (!isDragging) {
                return;
            }
            setPos({x: e.clientX - offset.x, y: e.clientY - offset.y});
        }
        const endDragging = () => {
            setIsDragging(false);
        }
        if (isDragging) {
            window.addEventListener('mousemove', drag);
            window.addEventListener('mouseup', endDragging);
        }
        return () => {
            window.removeEventListener('mousemove', drag);
            window.removeEventListener('mouseup', endDragging);
        };
    }, [isDragging, offset]);

    // width
    function increaseWidth() {
        setLineWidth(lineWidth+1);
    }
    function decreaseWidth() {
        if (lineWidth-1 == 0) {
            return;
        }
        setLineWidth(lineWidth-1);
    }

    const colors = ["bg-black", "bg-white", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-pink-500"];
    const colorsHex = ["#000000", "#ffffff", "#fb2c36", "#ff6900", "#f0b100", "#00c950", "#2b7fff", "#ad47ff", "#f6339a"];
    function setColor(i: number) {
        setStrokeStyle(colorsHex[i]);
        setColorIndex(i);
    }

    return (
        <div
            ref = {paletteRef}
            className={`fixed flex flex-row space-x-2 justify-center items-center bg-gray-50 text-black border border-black rounded-md select-none px-2 ${className}`}
            style={{left: pos.x, top:pos.y}}
            onMouseDown={startDragging}
            >
            <div className="flex flex-row space-x-2">
                <button onClick={decreaseWidth} className="border border-black size-6 text-center">
                    -
                </button>
                <p>{lineWidth}</p>
                <button onClick={increaseWidth} className="border border-black size-6 text-center">
                    +
                </button>
            </div>
            <div className="border-l border-l-gray-300 h-10"></div>
            <div className="flex flex-row space-x-0.5">
                {colors.map((color, i) => {
                        return (
                            <div key={i} className="rounded-full size-7 flex justify-center items-center">
                                <button className={`rounded-full ${color} border ${i==colorIndex ? "border-black size-7" : "border-gray-500 size-6"} hover:size-7 transition-all`} onClick={()=>{setColor(i)}}/>
                            </div>
                        );
                    })}
            </div>
            <div className="border-l border-l-gray-300 h-10"></div>
            <div>
                Width Presets
            </div>
        </div>
    );
}
