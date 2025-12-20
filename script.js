// 1. DEFINE YOUR BACKEND URL
// Check your backend terminal. If it says "Listening on port 3000", change 5000 to 3000 below.
const API_BASE_URL = 'http://localhost:5000'; 

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

async function fetchData() {
    try {
        console.log("Attempting to connect to backend...");

        // 2. THE FIX: Use the full URL to talk to the backend
        // Replace '/api/songs' with the actual route you created in your backend (e.g., /api/products, /users, etc.)
        const response = await fetch(`${API_BASE_URL}/api/songs`); 

        // Check if the backend actually responded with "OK"
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data received:", data);

        // 3. UPDATE YOUR PAGE (Example)
        // This assumes you have an element with id="content" in your HTML.
        // You can change this logic to display whatever data you are fetching.
        const contentDiv = document.getElementById('content') || document.body;
        
        // Clear "Loading..." text
        contentDiv.innerHTML = ''; 

        // Example: Loop through data and display it
        // If 'data' is an array, we map over it. If it's an object, we just display it.
        if (Array.isArray(data)) {
            data.forEach(item => {
                const p = document.createElement('p');
                p.textContent = JSON.stringify(item); // Simple display
                contentDiv.appendChild(p);
            });
        } else {
            const p = document.createElement('p');
            p.textContent = JSON.stringify(data);
            contentDiv.appendChild(p);
        }

    } catch (error) {
        console.error("Connection Failed:", error);
        
        // Display a user-friendly error on the screen
        document.body.innerHTML += `
            <div style="color: red; text-align: center; margin-top: 20px;">
                <h3>Connection Error</h3>
                <p>Could not talk to Backend at ${API_BASE_URL}</p>
                <p>Check the Console (F12) for details.</p>
            </div>
        `;
    }
}