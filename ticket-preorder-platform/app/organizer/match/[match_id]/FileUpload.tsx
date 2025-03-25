
"use client";
import { useState } from "react";

export default function TicketsDropZone() {
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

        const files = e.dataTransfer.files;

    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            console.log("Файл выбран:", files[0].name);
        }
    };

    return (
        <div
            className={`
        relative w-[400px] h-40 border-2 border-dashed 
        flex items-center justify-center text-center 
        transition-colors duration-200 rounded-lg
        ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300  bg-gray-100"}
      `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <p className="pointer-events-none text-gray-700 mx-2">
                {isDragOver ? "Отпустите файл здесь" : "Перетащите или нажмите для загрузки CSV"}
            </p>

            <input
                className="absolute inset-0 opacity-0 cursor-pointer"
                type="file"
                accept="text/csv"
                multiple={false}
                onChange={handleChange}
            />
        </div>
    );
}