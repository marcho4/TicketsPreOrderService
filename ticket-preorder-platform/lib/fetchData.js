export default async function fetchData(url, method, body, setIsLoading) {
    try {
        setIsLoading(true);
        return await fetch(url, {
            method: method,
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
}