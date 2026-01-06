document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop the page from reloading

    // 1. Grab the data from the form
    const submitBtn = document.querySelector('.cta-btn');
    const originalText = submitBtn.innerText;
    
    // Show loading state
    submitBtn.innerText = "🚀 Uploading...";
    submitBtn.disabled = true;

    // Get values from inputs
    // Note: We are selecting by 'placeholder' since we didn't add IDs. 
    // In a future pro update, we should add IDs to the HTML inputs.
    const inputs = document.querySelectorAll('input');
    const title = inputs[0].value;
    const description = inputs[1].value;
    const audioLink = inputs[2].value;
    const coverArt = inputs[3].value;

    const mixData = { title, description, audioLink, coverArt };

    try {
        // 2. Send data to the Backend
        // We use a relative path '/api/mixes' so it works on Localhost AND Render
        const response = await fetch('/api/mixes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mixData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ Success! Mix Published to the World.");
            document.getElementById('uploadForm').reset(); // Clear form
        } else {
            alert("❌ Error: " + result.error);
        }

    } catch (error) {
        console.error("Upload Error:", error);
        alert("❌ Failed to connect to server.");
    }

    // Reset button
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
});