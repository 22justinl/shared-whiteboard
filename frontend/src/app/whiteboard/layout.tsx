"use client";

import LinkButton from "@/components/ui/link-button";
import Menu from "@/components/ui/whiteboard/menu";
import ShareMenu from "@/components/ui/whiteboard/sharemenu";

import WhiteboardProvider from "@/lib/whiteboard-context";
import SessionProvider from "@/lib/session-context";
import MemberTab from "@/components/ui/whiteboard/membertab";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div className="flex flex-col">
            <SessionProvider>
                <WhiteboardProvider>
                    {/*header buttons*/}
                    <div className="top-0 left-0 flex flex-row z-10">
                        <Menu className="m-2" />{/*icon*/}
                        <ShareMenu />
                        <LinkButton text="Home" link="/" className="m-2" />
                        {/*share popup*/}
                        <MemberTab />
                    </div>
                    {children}
                </WhiteboardProvider>
            </SessionProvider>
        </div>
    );
}
