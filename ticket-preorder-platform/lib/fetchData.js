export default async function fetchData(url, method, body, setIsLoading) {
    try {
        setIsLoading(true);
        const response = await fetch(url, {
            method: method,
            credentials: "include",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return response;
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
}