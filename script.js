async function fetchData() {
    const userId = localStorage.getItem("userId") || prompt("Enter your User ID:");
    if (!userId) {
        alert("User ID is required!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/get-time-data/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        console.log("Fetched Data:", data); // Debugging log

        // Check if data is valid
        if (!data || typeof data !== "object") {
            alert("Invalid data received");
            return;
        }

        // Get the chart canvas
        const ctx = document.getElementById("timeChart").getContext("2d");

        // Destroy existing chart instance if it exists
        if (window.myChart) {
            window.myChart.destroy();
        }

        // Create the chart
        window.myChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["News", "Poem", "Games", "Quiz", "Mental Health", "Behavior Guide"],
                datasets: [{
                    label: "Time Spent (secs)",
                    data: [data.news, data.poem, data.games, data.quiz, data.mentalHealth, data.behaviorGuide],
                    backgroundColor: ["red", "blue", "green", "purple", "orange", "cyan"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Check the console.");
    }
}

fetchData();
