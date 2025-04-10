import {MatchData} from "@/app/matches/MatchCard";
import { useCallback } from "react";

export const checkImageExists = async (url: string): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
        
        const response = await fetch(url, { 
            method: "HEAD",
            signal: controller.signal
         });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        return false;
    }
};


export async function fetchMatchData(id: string): Promise<boolean> {
    try {
        const imageUrl = `https://match-photos.s3.us-east-1.amazonaws.com/matches/${id}`;
        const imageExists = await checkImageExists(imageUrl);
        return imageExists;

    } catch (error) {
        throw error;
    }
}

export const fetchRequests = async () => {
    const response = await fetch("http://localhost:8000/api/admin/requests", {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch requests");
    }

    let body = await response.json();
    return body.data;
};


export const fetchTickets = async (userId: string) => {
    try {
        const response = await fetch(`http://localhost:8000/api/tickets/user/${userId}`, {
            method: 'GET',
            credentials: 'same-origin',
        });
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

