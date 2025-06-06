"use client";

import { useState, useContext, createContext, useRef, useEffect } from "react";

type WhiteboardContextType = {
    strokeStyle: string | CanvasGradient | CanvasPattern;
    setStrokeStyle: React.Dispatch<React.SetStateAction<string | CanvasGradient | CanvasPattern>>;

    colorIndex: number; // -1 for custom color?
    setColorIndex: React.Dispatch<React.SetStateAction<number>>;

    lineWidth: number;
    setLineWidth: React.Dispatch<React.SetStateAction<number>>;

    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    canvasReady: boolean;
    setCanvasReady: React.Dispatch<React.SetStateAction<boolean>>;

    dbRef: React.RefObject<IDBDatabase | null>;
    dbReady: boolean;
    setDbReady: React.Dispatch<React.SetStateAction<boolean>>;

}

const WhiteboardContext = createContext<WhiteboardContextType | null>(null);

export default function WhiteboardProvider({ children }: { children: React.ReactNode }) {
    const [strokeStyle, setStrokeStyle] = useState<string | CanvasGradient | CanvasPattern>("#000000");
    const [colorIndex, setColorIndex] = useState(0);
    const [lineWidth, setLineWidth] = useState(1);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasReady, setCanvasReady] = useState(false);

    const dbRef = useRef<IDBDatabase | null>(null);
    const [dbReady, setDbReady] = useState(false);

    useEffect(() => {
        if (canvasRef.current) {
            setCanvasReady(true);
        }
    }, []);

    return (
        <WhiteboardContext.Provider value={{ strokeStyle, setStrokeStyle, colorIndex, setColorIndex, lineWidth, setLineWidth, canvasRef, canvasReady, setCanvasReady, dbRef, dbReady, setDbReady }}>
            {children}
        </WhiteboardContext.Provider>
    );
}

export function useWhiteboard() {
    const context = useContext(WhiteboardContext);
    if (!context) {
        throw new Error("useWhiteboard must be used inside WhiteboardProvider");
    }
    return context;
}
