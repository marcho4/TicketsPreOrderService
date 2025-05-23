import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-100 flex justify-center items-center"
        >
            <Card
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg z-[100] w-full max-w-2xl relative"
            >
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="h-6 w-6 text-gray-500 hover:text-black" />
                </Button>
                {children}
            </Card>
        </div>
    );
}