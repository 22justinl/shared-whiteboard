

export interface CanvasChange {
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
