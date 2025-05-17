"use-client";

import { useState, useRef, useEffect } from "react";
import { useWhiteboard } from "@/lib/whiteboard-context";

export default function WhiteboardPalette({ className } : {className?: string}) {
    const paletteRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [pos, setPos] = useState({x:50,y:50});
    const [offset, setOffset] = useState({x:0,y:0});
    const {lineWidth, setLineWidth} = useWhiteboard();

    const startDragging = (e: React.MouseEvent) => {
        console.log("start dragging");
        setIsDragging(true);
        setOffset({x: e.clientX - pos.x, y: e.clientY - pos.y});
    }
    //useEffect(() => {
    //    setPos({x: window.innerWidth/2, y: window.innerHeight/2});
    //},[])

    useEffect(() => {
        const drag = (e: MouseEvent) => {
            if (!isDragging) {
                return;
            }
            setPos({x: e.clientX - offset.x, y: e.clientY - offset.y});
        }
        const endDragging = () => {
            console.log("end dragging");
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

    function increaseWidth() {
        setLineWidth(lineWidth+1);
    }
    function decreaseWidth() {
        if (lineWidth-1 == 0) {
            return;
        }
        setLineWidth(lineWidth-1);
    }

    return (
        <div
            ref = {paletteRef}
            className={`fixed bg-gray-50 text-black border border-black rounded-md p-2 select-none ${className}`}
            style={{left: pos.x, top:pos.y}}
            onMouseDown={startDragging}
            >
            <div className="flex flex-row space-x-3">
                <button onClick={decreaseWidth} className="border border-black min-w-6">
                    -
                </button>
                <p>{lineWidth}</p>
                <button onClick={increaseWidth} className="border border-black min-w-6">
                    +
                </button>
            </div>
        </div>
    );
}
