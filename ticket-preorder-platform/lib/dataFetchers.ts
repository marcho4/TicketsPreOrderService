import {MatchData} from "@/app/matches/MatchCard";

export const checkImageExists = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch (error) {
        return false;
    }
};


export async function fetchMatchData(id: string): Promise<MatchData> {
    try {
        const response = await fetch(`http://localhost:8000/api/matches/${id}`, {
            method: "GET",
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`Не удалось получить данные матча: ${response.statusText}`);
        }
        const result = await response.json();


        const imageUrl = `https://match-photos.s3.us-east-1.amazonaws.com/matches/${id}`;
        await checkImageExists(imageUrl).then((exists) => {
            if (exists) {
                result.data.logoUrl = imageUrl;
            } else {
                result.data.logoUrl = "/match_preview.jpg";
            }
        });

        return result.data as MatchData;
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
        let response = await fetch(`http://localhost:8000/api/tickets/user/${userId}`, {
            method: 'GET',
            credentials: 'same-origin',
        });
        response = await response.json();
        return response.data || [];
    } catch (error) {
        console.error(error);
        return [];
    }
};


export const fetchMatches = async () => {
    try {
        let response = await fetch(`http://localhost:8000/api/matches/all`, {
            method: "GET",
            credentials: "include",
        })
        response = await response.json();
        return response.data;
    } catch (e) {
        console.error(e)
    }
}