const blogContainer = document.getElementById("blog-container");

// Function to fetch random news
async function fetchRandomNews() {
    try {
        // Saurav Tech News API endpoint for health news
        const apiUrl = `https://saurav.tech/NewsAPI/top-headlines/category/health/in.json`;

        console.log("Fetching from:", apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            console.error('Error fetching the news:', response.status, response.statusText);
            return [];
        }

        const data = await response.json();
        console.log("Fetched data:", data);

        if (data.articles && data.articles.length > 0) {
            return data.articles;
        } else {
            console.warn('No articles found.');
            return [];
        }
    } catch (error) {
        console.error("Error fetching random news:", error);
        return [];
    }
}

// Function to display the fetched news articles
function displayBlogs(articles) {
    blogContainer.innerHTML = ""; // Clear previous articles

    articles.forEach((article) => {
        const blogCard = document.createElement("div");
        blogCard.classList.add("blog-card");

        const img = document.createElement("img");
        img.src = article.urlToImage || 'https://placehold.co/600x400'; // Fallback image
        img.alt = article.title;

        const title = document.createElement("h2");
        title.textContent = article.title;

        const description = document.createElement("p");
        description.textContent = article.description || 'No description available.';

        blogCard.appendChild(img);
        blogCard.appendChild(title);
        blogCard.appendChild(description);
        blogContainer.appendChild(blogCard);
    });
}

// IIFE to fetch and display news immediately
(async function() {
    const articles = await fetchRandomNews();
    displayBlogs(articles);
})();