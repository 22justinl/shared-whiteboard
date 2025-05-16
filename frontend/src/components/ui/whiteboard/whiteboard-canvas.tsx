"use client";

import { useState } from 'react';

export default function WhiteboardCanvas() {
    const [testvar, setTestvar] = useState(0);

    function incrNum() {
        setTestvar(testvar+1);
    }
    return (
        <div className="flex flex-col h-full items-center">
            <h2>{testvar}</h2>
            <button onClick={incrNum} className="w-full">increment number</button>
            <h1>canvas</h1>
        </div>
    );
}
