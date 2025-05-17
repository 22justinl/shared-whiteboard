"use client";

import { useState, useRef, useEffect } from "react";

export default function WhiteboardCanvas({ className } : { className: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
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
        ctx.closePath();
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
        </div>
    );
}
