"use client";
import { useState } from "react";
import {Button} from "@/components/ui/button";

interface TicketsDropZoneProps {
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    resetTicketsFile: () => void;
    file: any;
    setFile: any;
}

export default function TicketsDropZone({ file, setFile, handleFileChange, resetTicketsFile }: TicketsDropZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        const { files } = e.dataTransfer;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };

    return (
        <div>
            <div
                className={`
          relative w-[400px] h-40 border-2 border-dashed 
          flex items-center justify-center text-center 
          transition-colors duration-200 rounded-lg
          ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-100"}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <p className="pointer-events-none text-gray-700 mx-2">
                    {file ? (
                        <span>Выбран файл: <strong>{file.name}</strong></span>
                    ) : (isDragOver ? "Отпустите файл здесь" : <span>Перетащите или нажмите для загрузки .csv</span>)
                    }

                </p>

                <input
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    type="file"
                    accept="text/csv"
                    multiple={false}
                    onChange={handleFileChange}
                />
            </div>
            <div className={"flex flex-col py-4 items-center"}>
                <Button
                    disabled={!file}
                    className="w-full max-w-64"
                    variant="destructive"
                    onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                    }}>
                    Сбросить файл
                </Button>
            </div>
        </div>
    );
}