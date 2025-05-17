import { useState, useContext, createContext } from "react";

type WhiteboardContextType = {
    color: string;
    setColor: React.Dispatch<React.SetStateAction<string>>;

    lineWidth: number;
    setLineWidth: React.Dispatch<React.SetStateAction<number>>;
}

const WhiteboardContext = createContext<WhiteboardContextType | null>(null);

export default function WhiteboardProvider({children}: {children: React.ReactNode}) {
    const [color, setColor] = useState("#000000");
    const [lineWidth, setLineWidth] = useState(2);

    return (
        <WhiteboardContext.Provider value={{color, setColor, lineWidth, setLineWidth}}>
            {children}
        </WhiteboardContext.Provider>
    );
}

export function useWhiteboard() {
    const context = useContext(WhiteboardContext);
    return context;
}
