import { useState } from "react";
import Button from "@/components/ui/button";

export default function Menu({ className }: {className?: string}) {
    const [isOpen, setIsOpen] = useState(false);
    function toggleMenu() {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`${className}`}>
            <Button text="Menu" onClick={toggleMenu}/>
            <div className={`absolute top-0 left-0 bg-white flex flex-col text-black border rounded-r-lg space-x-6 px-5 py-5 justify-start ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                <div className="flex flex-row justify-between min-w-72">
                    <h1 className="font-bold text-xl">
                        Menu
                    </h1>
                    <button onClick={toggleMenu} className="hover:bg-[#ccc]">
                        x {/*icon*/}
                    </button>
                </div>
                <ul>
                    <li>
                        <button>
                            b1
                        </button>
                    </li>
                    <li>
                        <button>
                            b2
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}
