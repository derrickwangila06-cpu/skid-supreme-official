/* =========================================
   MAIN WEBSITE LOGIC (The Receiver)
   ========================================= */
// Point to your backend
const API_URL = 'http://localhost:5000';

const mixContainer = document.getElementById('mix-container');
const gigContainer = document.getElementById('gig-container'); // Make sure your HTML has this ID in the Gigs section
const loadingScreen = document.getElementById('loading');

// MASTER PLAYER ELEMENTS
const masterPlayer = document.getElementById('master-player');
const audioPlayer = document.getElementById('main-audio');
const playerTitle = document.getElementById('player-title');
const playerDesc = document.getElementById('player-desc');
const playerImg = document.getElementById('player-img');
const playBtn = document.getElementById('playBtn');
const downloadLink = document.getElementById('downloadLink');

// STATE
let isPlaying = false;

/* =========================================
   1. ON LOAD: FETCH DATA
   ========================================= */
window.addEventListener('DOMContentLoaded', async () => {
    await loadMixes();
    await loadGigs();
});

/* =========================================
   2. FETCH MIXES
   ========================================= */
async function loadMixes() {
    try {
        const response = await fetch(`${API_URL}/api/mixes`);
        const mixes = await response.json();
        
        // Hide Loading Animation
        if(loadingScreen) loadingScreen.style.display = 'none';

        if (mixes.length === 0) {
            mixContainer.innerHTML = '<p style="text-align:center; color: #888;">No mixes dropped yet.</p>';
            return;
        }

        // Generate HTML for each mix
        mixContainer.innerHTML = mixes.map(mix => {
            // Safety: Ensure paths use forward slashes for browser compatibility
            const cleanImage = mix.image ? mix.image.replace(/\\/g, '/') : 'assets/logo.jpg';
            const cleanAudio = mix.audio ? mix.audio.replace(/\\/g, '/') : '#';

            return `
            <div class="mix-card">
                <div class="card-image" style="background-image: url('${cleanImage}');">
                    <button class="card-play-btn" onclick="playTrack('${mix.title}', '${mix.description}', '${cleanImage}', '${cleanAudio}')">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                <div class="card-info">
                    <h3>${mix.title}</h3>
                    <p>${mix.description}</p>
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Error loading mixes:", error);
        if(mixContainer) mixContainer.innerHTML = '<p style="text-align:center; color:red;">Offline Mode (Server not reachable)</p>';
    }
}

/* =========================================
   3. FETCH GIGS
   ========================================= */
async function loadGigs() {
    const gigList = document.getElementById('events-list') || document.getElementById('gig-container');
    if (!gigList) return;

    try {
        const response = await fetch(`${API_URL}/api/gigs`);
        const gigs = await response.json();

        if (gigs.length === 0) {
            gigList.innerHTML = '<p style="color:#666;">No upcoming dates.</p>';
            return;
        }

        gigList.innerHTML = gigs.map(gig => `
            <div style="background:#111; padding:15px; margin-bottom:10px; border-left:4px solid #ff0055; border-radius: 4px;">
                <h3 style="color:white; font-size:16px; margin-bottom: 5px;">${gig.venue}</h3>
                <p style="color:#888; font-size: 14px;">
                    <i class="fas fa-map-marker-alt" style="color:#ff0055;"></i> ${gig.location} &nbsp;•&nbsp; 
                    <i class="fas fa-calendar" style="color:#ff0055;"></i> ${gig.date}
                </p>
                ${gig.ticketLink ? `<a href="${gig.ticketLink}" target="_blank" style="color:#00e5ff; font-size:12px; text-decoration:none; display:inline-block; margin-top:5px;">Get Tickets &rarr;</a>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.log("Gigs could not load");
    }
}

/* =========================================
   4. PLAYER LOGIC
   ========================================= */
// This function is called when you click the Play button on a card
window.playTrack = function(title, desc, image, audio) {
    // 1. Show the Player
    masterPlayer.classList.remove('player-hidden');

    // 2. Update Info
    playerTitle.innerText = title;
    playerDesc.innerText = desc;
    playerImg.src = image;
    downloadLink.href = audio;

    // 3. Play Audio
    audioPlayer.src = audio;
    
    // Safety check: only play if valid source
    if(audio && audio !== '#') {
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                updatePlayIcon();
            })
            .catch(err => console.log("Auto-play blocked:", err));
    }
};

// Toggle Play/Pause on the footer player
if(playBtn) {
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
        } else {
            audioPlayer.play();
            isPlaying = true;
        }
        updatePlayIcon();
    });
}

function updatePlayIcon() {
    if (isPlaying) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}