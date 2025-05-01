export const logout = async (router) => {
    try {
        let resp = await fetch("http://84.201.129.122:8000/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        if (resp.ok) {
            router.push("/"); // Redirect
            window.location.reload();
        } else {
            console.error("Unsuccessful logout request");
        }
    } catch (error) {
        console.error("Logout failed:", error);
    }
};