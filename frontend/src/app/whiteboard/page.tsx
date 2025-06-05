import Whiteboard from '@/components/ui/whiteboard/whiteboard';
import WhiteboardProvider from "@/lib/whiteboard-context";

export default function Page() {
    return (
        <div>
            <WhiteboardProvider>
                <Whiteboard className="absolute top-0 left-0 w-full h-full z-0"/>
            </WhiteboardProvider>
        </div>
    );
}
