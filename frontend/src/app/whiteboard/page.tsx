"use client";

import Whiteboard from '@/components/ui/whiteboard/whiteboard';
import LinkButton from "@/components/ui/link-button";
import Menu from "@/components/ui/whiteboard/menu";
import WhiteboardProvider from "@/lib/whiteboard-context";

export default function Page() {
    return (
        <div>
            <WhiteboardProvider>
                <Whiteboard className="z-0"/>
                <div className="fixed top-0 left-0 flex flex-row w-full z-10">
                    <Menu className="m-2"/>{/*icon*/}
                    <LinkButton text="Home" link="/" className="m-2"/>
                </div>
            </WhiteboardProvider>
        </div>
    );
}
