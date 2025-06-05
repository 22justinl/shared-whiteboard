"use client";

import { useState, useContext, createContext } from "react";

type WhiteboardContextType = {
    strokeStyle: string | CanvasGradient | CanvasPattern;
    setStrokeStyle: React.Dispatch<React.SetStateAction<string | CanvasGradient | CanvasPattern>>;

    colorIndex: number; // -1 for custom color?
    setColorIndex: React.Dispatch<React.SetStateAction<number>>;

    lineWidth: number;
    setLineWidth: React.Dispatch<React.SetStateAction<number>>;
}

const WhiteboardContext = createContext<WhiteboardContextType | null>(null);

export default function WhiteboardProvider({children}: {children: React.ReactNode}) {
    const [strokeStyle, setStrokeStyle] = useState<string | CanvasGradient | CanvasPattern>("#000000");
    const [colorIndex, setColorIndex] = useState(0);
    const [lineWidth, setLineWidth] = useState(1);

    return (
        <WhiteboardContext.Provider value={{strokeStyle, setStrokeStyle, colorIndex, setColorIndex, lineWidth, setLineWidth}}>
            {children}
        </WhiteboardContext.Provider>
    );
}

export function useWhiteboard() {
    const context = useContext(WhiteboardContext);
    if (!context) {
        throw new Error("couldn't get context");
    }
    return context;
}
