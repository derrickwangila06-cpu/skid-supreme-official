// --- 1. TOGGLE SECTIONS LOGIC ---
const btnMix = document.getElementById('btn-mix');
const btnGig = document.getElementById('btn-gig');
const sectionMix = document.getElementById('section-mix');
const sectionGig = document.getElementById('section-gig');
const sectionTitle = document.getElementById('section-title');

btnMix.addEventListener('click', () => {
    // Show Mix, Hide Gig
    sectionMix.style.display = 'block';
    sectionGig.style.display = 'none';
    sectionTitle.innerText = "Upload New Mix";
    
    // Update Sidebar Active State
    btnMix.classList.add('active');
    btnGig.classList.remove('active');
});

btnGig.addEventListener('click', () => {
    // Show Gig, Hide Mix
    sectionMix.style.display = 'none';
    sectionGig.style.display = 'block';
    sectionTitle.innerText = "Add Upcoming Gig";
    
    // Update Sidebar Active State
    btnGig.classList.add('active');
    btnMix.classList.remove('active');
});

// --- 2. UPLOAD MIX LOGIC ---
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = document.querySelectorAll('#uploadForm input');
    
    const mixData = {
        title: inputs[0].value,
        description: inputs[1].value,
        audioLink: inputs[2].value,
        coverArt: inputs[3].value
    };

    await sendData('/api/mixes', mixData, "Mix Published!");
    document.getElementById('uploadForm').reset();
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

    await sendData('/api/gigs', gigData, "Gig Added!");
    document.getElementById('gigForm').reset();
});

// --- HELPER FUNCTION TO SEND DATA ---
async function sendData(url, data, successMsg) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("✅ Success: " + successMsg);
        } else {
            alert("❌ Error sending data.");
        }
    } catch (error) {
        console.error(error);
        alert("❌ Failed to connect.");
    }
}