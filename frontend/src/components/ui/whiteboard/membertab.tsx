"use client";

import Button from "@/components/ui/button";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/session-context";
import Image from "next/image";

export default function MemberTab() {
    const { sessionActive, memberNames } = useSession();
    const [memberTabOpen, setMemberTabOpen] = useState(false);
    useEffect(() => {
        if (sessionActive) {
            setMemberTabOpen(false);
        }
    }, [sessionActive]);
    return (
        <div>
            <Button className={`m-2 ${sessionActive ? '' : 'hidden'}`}
                onClick={() => setMemberTabOpen(!memberTabOpen)}>
                <Image src="/images/members.svg" width={20} height={20} objectFit="contain" alt="Members"/>
            </Button>
            <div className={`absolute top-0 bg-white flex flex-col text-black border rounded-r-lg space-x-6 px-5 py-5 justify-start transition-all ${memberTabOpen && sessionActive ? 'left-0' : '-left-50'}`}>
                <h1>Members</h1>
                <ul>
                    {memberNames.map((memberName, i) => {
                        return (
                            <li key={i}>{memberName}</li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
