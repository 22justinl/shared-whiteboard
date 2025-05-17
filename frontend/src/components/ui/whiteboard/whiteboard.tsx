"use client";

import WhiteboardPalette from "@/components/ui/whiteboard/whiteboard-palette";
import Button from "@/components/ui/button";

import { useState, useRef, useEffect } from "react";
import { useWhiteboard } from "@/lib/whiteboard-context";

export default function Whiteboard({ className } : { className: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const {color, lineWidth} = useWhiteboard();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error("couldn't get canvas reference");
            return;
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth;
        const context = canvas.getContext('2d')!
        context.lineWidth = 2;
        context.strokeStyle = '#000000';
        context.lineCap = 'round';
        setCtx(context);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error("couldn't get canvas reference");
            return;
        }
        const context = canvas.getContext('2d')!
        context.lineWidth = lineWidth;
        context.strokeStyle = color;
        context.lineCap = 'round';
    }, [color, lineWidth]);

    function startDrawing(e: React.MouseEvent) {
        if (!ctx) { return; }
        setIsDrawing(true);
        ctx.beginPath();
        const {offsetX, offsetY} = e.nativeEvent;
        ctx.moveTo(offsetX, offsetY);
    }
    function draw(e: React.MouseEvent) {
        if (!ctx) { return; }
        if (!isDrawing) {
            return;
        }
        const {offsetX, offsetY} = e.nativeEvent;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    }
    function endDrawing() {
        if (!ctx) { return; }
        setIsDrawing(false);
        ctx.stroke();
    }

    function resetCanvas() {
        const ctx = canvasRef.current!.getContext('2d');
        ctx!.reset();
        ctx!.lineWidth = lineWidth;
        ctx!.strokeStyle = color;
        ctx!.lineCap = 'round';
    }

    return (
        <div className={`absolute top-0 left-0 w-full h-full flex flex-col items-center bg-white ${className}`}>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={endDrawing}
                onMouseMove={draw}
                onMouseLeave={endDrawing}
                >
            </canvas>
            <WhiteboardPalette/>
            <Button text="Reset canvas" onClick={resetCanvas} className="fixed bottom-2 left-2"/>
        </div>
    );
}
