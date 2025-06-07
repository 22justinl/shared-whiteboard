"use client";

import LinkButton from "@/components/ui/link-button";
import Menu from "@/components/ui/whiteboard/menu";
import ShareMenu from "@/components/ui/whiteboard/sharemenu";

import WhiteboardProvider from "@/lib/whiteboard-context";
import SessionProvider from "@/lib/session-context";
import MemberTab from "@/components/ui/whiteboard/membertab";
import Image from "next/image";

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
                        <LinkButton link="/" className="m-2">
                            <Image src="/images/home.svg" alt="Home" width={20} height={20} objectFit="contain"/>
                        </LinkButton>
                        {/*share popup*/}
                        <MemberTab />
                    </div>
                    {children}
                </WhiteboardProvider>
            </SessionProvider>
        </div>
    );
}
