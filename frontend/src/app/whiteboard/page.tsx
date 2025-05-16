import WhiteboardCanvas from '@/components/ui/whiteboard/whiteboard-canvas';
import LinkButton from "@/components/ui/link-button";

export default function Page() {
    return (
        <div>
            <div className="fixed top-2 left-2 flex flex-row space-x-3">
                <LinkButton text="Menu" link="/whiteboard" />
                <LinkButton text="Home" link="/" />
            </div>
            {/*<div className="flex flex-col">
                <div className="bg-white text-black flex flex-col py-8 px-8 border-8 border-gray-800">
                    <WhiteboardCanvas />
                </div>
            </div>*/}
        </div>
    );
}
