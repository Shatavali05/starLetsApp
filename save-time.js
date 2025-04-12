async function saveTime(activity, timeSpent) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("User ID not found. Please log in.");
        return;
    }

    const response = await fetch("http://localhost:5000/save-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, activity, timeSpent })
    });

    const result = await response.json();
    alert(result.message);
}
