"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/button";
import { useWhiteboard } from "@/lib/whiteboard-context";
import Image from "next/image";

export default function Menu({ className }: { className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { canvasRef, canvasReady, dbRef, dbReady } = useWhiteboard();

    const downloadImage = useRef(() => {});
    const downloadSnapshot = useRef(() => {});

    function toggleMenu() {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (canvasReady && dbReady) {
            downloadImage.current = () => {
                if (!canvasRef.current) { return; }
                canvasRef.current.toBlob((blob) => {
                    const url = URL.createObjectURL(blob!);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'canvas.png';
                    link.click();
                    URL.revokeObjectURL(url);
                }, 'image/png');
            };
            downloadSnapshot.current = () => {
                if (!dbRef.current) { return; }
                const tx = dbRef.current.transaction("canvases", "readonly");
                const store = tx.objectStore("canvases");
                const getAllRequest = store.getAll();
                getAllRequest.onsuccess = () => {
                    const data = JSON.stringify(getAllRequest.result);
                    const blob = new Blob([data]);
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'canvas.amongus';
                    link.click();
                    URL.revokeObjectURL(url);
                };
            };
        }
    }, [canvasRef, canvasReady, dbRef, dbReady]);

    return (
        <div className={`${className}`}>
            <Button onClick={toggleMenu} className="rounded-full">
                <Image src="/images/menu.svg" alt="Menu" width={20} height={20} objectFit="contain"/>
            </Button>
            <div className={`absolute top-0 bg-white flex flex-col text-black border rounded-r-lg space-x-6 px-5 py-5 justify-start transition-all ${isOpen ? "left-0" : "-left-100"}`}>
                <div className="flex flex-row justify-between min-w-72">
                    <h1 className="font-bold text-xl">
                        Menu
                    </h1>
                    <button onClick={toggleMenu} className="hover:bg-[#ccc]">
                        x {/*icon*/}
                    </button>
                </div>
                <div>
                    <ul>
                        <li>
                            <Button onClick={downloadImage.current}>
                                Download Canvas as PNG
                            </Button>
                        </li>
                        <li>
                            <Button onClick={downloadSnapshot.current}>
                                Download Canvas Data
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
