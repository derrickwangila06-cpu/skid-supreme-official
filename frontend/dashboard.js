// ==========================================
// 🔒 SECURITY CHECK (The Bouncer)
// ==========================================
// If the user doesn't have the "isAdmin" badge, send them back to login
if (!sessionStorage.getItem("isAdmin")) {
    window.location.href = "admin.html";
}

// ==========================================
// CONFIGURATION
// ==========================================
// ... (rest of your code continues below) ...// ==========================================
// CONFIGURATION
// ==========================================
// This points directly to your backend "Brain"
const API_URL = "http://localhost:5000";

// --- 1. TOGGLE SECTIONS LOGIC ---
const btnMix = document.getElementById('btn-mix');
const btnGig = document.getElementById('btn-gig');
const sectionMix = document.getElementById('section-mix');
const sectionGig = document.getElementById('section-gig');
const sectionTitle = document.getElementById('section-title');

btnMix.addEventListener('click', () => {
    sectionMix.style.display = 'block';
    sectionGig.style.display = 'none';
    sectionTitle.innerText = "Upload New Mix";
    btnMix.classList.add('active');
    btnGig.classList.remove('active');
});

btnGig.addEventListener('click', () => {
    sectionMix.style.display = 'none';
    sectionGig.style.display = 'block';
    sectionTitle.innerText = "Add Upcoming Gig";
    btnGig.classList.add('active');
    btnMix.classList.remove('active');
});

// --- 2. UPLOAD MIX LOGIC ---
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('mixTitle').value;
    const desc = document.getElementById('mixDesc').value;
    const audioInput = document.getElementById('mixFile');
    const imageInput = document.getElementById('mixCover');
    const submitBtn = document.querySelector('#uploadForm button');

    // Show loading state
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "⏳ Connecting to Server...";
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    
    if (audioInput.files[0]) {
        formData.append('audio', audioInput.files[0]);
    }
    if (imageInput.files[0]) {
        formData.append('cover', imageInput.files[0]);
    }

    try {
        // USE THE FULL URL HERE
        const response = await fetch(`${API_URL}/api/mixes`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert("✅ Success! Mix Uploaded to Database.");
            document.getElementById('uploadForm').reset();
        } else {
            const errorData = await response.json();
            alert("❌ Upload Failed: " + (errorData.error || "Unknown Error"));
        }
    } catch (error) {
        console.error(error);
        alert("❌ Error: Could not reach the server at Port 5000. Is the terminal running?");
    }

    // Reset button
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
});

// --- 3. UPLOAD GIG LOGIC ---
document.getElementById('gigForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = document.querySelectorAll('#gigForm input');

    const gigData = {
        date: inputs[0].value,
        venue: inputs[1].value,
        location: inputs[2].value,
        ticketLink: inputs[3].value || '#'
    };

    try {
        // USE THE FULL URL HERE
        const response = await fetch(`${API_URL}/api/gigs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gigData)
        });

        if (response.ok) {
            alert("✅ Gig Added Successfully!");
            document.getElementById('gigForm').reset();
        } else {
            alert("❌ Error adding gig.");
        }
    } catch (error) {
        console.error(error);
        alert("❌ Connection Failed.");
    }
});