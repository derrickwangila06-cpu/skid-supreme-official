document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // CONFIGURATION
    // ==========================================
    // This connects the frontend to your backend "Brain"
    const API_URL = "http://localhost:5000";

    // DOM ELEMENTS
    const loadingScreen = document.getElementById('loading');
    const mixFeed = document.getElementById('mix-feed');
    const eventsList = document.getElementById('events-list');
    
    // Player Elements
    const masterPlayer = document.getElementById('master-player');
    const mainAudio = document.getElementById('main-audio');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const currTime = document.getElementById('currTime');
    const playerTitle = document.getElementById('player-title');
    const playerImg = document.getElementById('player-img');
    const downloadLink = document.getElementById('downloadLink');

    let mixes = [];
    let isPlaying = false;
    let currentMixIndex = 0;

    // ==========================================
    // 1. FETCH REAL DATA
    // ==========================================
    
    // Fetch Mixes and Gigs from the Server (Port 5000)
    Promise.all([
        fetch(`${API_URL}/api/mixes`).then(res => res.json()),
        fetch(`${API_URL}/api/gigs`).then(res => res.json())
    ]).then(([mixData, gigData]) => {
        
        // --- HANDLE MIXES ---
        mixes = mixData;
        loadingScreen.style.display = 'none';
        
        if (mixes.length > 0) {
            renderMixes(mixes);
        } else {
            mixFeed.innerHTML = '<p style="text-align:center; color:#666; width:100%;">No mixes found in the crates yet.</p>';
        }

        // --- HANDLE GIGS ---
        if (gigData.length > 0) {
            renderGigs(gigData);
        } else {
            eventsList.innerHTML = '<p style="color:#666;">No upcoming dates announced.</p>';
        }

    }).catch(err => {
        console.error("Error loading content:", err);
        loadingScreen.innerHTML = '<p style="color:red;">Could not connect to Server (Port 5000).</p>';
    });

    // ==========================================
    // 2. RENDER FUNCTIONS
    // ==========================================

    function renderMixes(list) {
        mixFeed.innerHTML = '';
        
        list.forEach((mix, index) => {
            // FIX: If the image is stored on the server, add the server URL
            // If it's a web link (http...), keep it as is. If it's /uploads/..., add localhost:5000
            let imageSrc = mix.coverArt || 'logo.jpg';
            if (imageSrc.startsWith('/uploads')) {
                imageSrc = API_URL + imageSrc;
            }

            const card = document.createElement('div');
            card.classList.add('mix-card');
            
            card.innerHTML = `
                <div class="card-image" style="background-image: url('${imageSrc}')">
                    <button class="card-play-btn" onclick="loadAndPlay(${index})">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                <div class="card-info">
                    <h3>${mix.title}</h3>
                    <p>${mix.description}</p>
                    <div class="card-stats">
                        <span><i class="fas fa-download"></i> ${mix.downloads}</span>
                        <button class="share-btn" onclick="shareMix('${mix.title}')">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            mixFeed.appendChild(card);
        });
    }

    function renderGigs(list) {
        eventsList.innerHTML = '';
        
        list.forEach(gig => {
            const gigItem = document.createElement('div');
            gigItem.style.cssText = `
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                background: #111; 
                padding: 15px; 
                margin-bottom: 10px; 
                border-radius: 8px; 
                border-left: 3px solid #ff0055;
                border-bottom: 1px solid #222;
            `;
            
            gigItem.innerHTML = `
                <div>
                    <h4 style="margin:0; font-size:16px; color:white;">${gig.date}</h4>
                    <p style="margin:5px 0 0; color:#888; font-size:13px;">${gig.venue} - ${gig.location}</p>
                </div>
                <a href="${gig.ticketLink}" target="_blank" class="cta-btn" 
                   style="margin-top:0; padding:8px 15px; font-size:12px; height:auto;">
                   Tickets
                </a>
            `;
            eventsList.appendChild(gigItem);
        });
    }

    // ==========================================
    // 3. PLAYER LOGIC
    // ==========================================
    
    window.loadAndPlay = (index) => {
        currentMixIndex = index;
        const mix = mixes[index];

        // Prepare Image URL
        let imageSrc = mix.coverArt || 'logo.jpg';
        if (imageSrc.startsWith('/uploads')) {
            imageSrc = API_URL + imageSrc;
        }

        // Prepare Audio URL
        let audioSrc = mix.audioLink;
        if (audioSrc.startsWith('/uploads')) {
            audioSrc = API_URL + audioSrc;
        }

        // Update Player UI
        playerTitle.innerText = mix.title;
        playerImg.src = imageSrc;
        mainAudio.src = audioSrc;
        downloadLink.href = audioSrc;
        
        // Update Stats
        updateDownloadCount(mix._id);

        masterPlayer.classList.remove('player-hidden');
        playSong();
    };

    function updateDownloadCount(id) {
        fetch(`${API_URL}/api/mixes/${id}/download`, { method: 'POST' })
            .catch(err => console.error("Count Error", err));
    }

    window.shareMix = (title) => {
        if (navigator.share) {
            navigator.share({
                title: 'DJ SKID SUPREME',
                text: `Check out this mix: ${title}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            alert("Link copied to clipboard!");
        }
    };

    function playSong() {
        mainAudio.play();
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }

    function pauseSong() {
        mainAudio.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    // Controls
    playBtn.addEventListener('click', () => isPlaying ? pauseSong() : playSong());
    
    nextBtn.addEventListener('click', () => {
        currentMixIndex = (currentMixIndex + 1) % mixes.length;
        window.loadAndPlay(currentMixIndex);
    });

    prevBtn.addEventListener('click', () => {
        currentMixIndex = (currentMixIndex - 1 + mixes.length) % mixes.length;
        window.loadAndPlay(currentMixIndex);
    });

    mainAudio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.srcElement;
        if (duration) {
            progressBar.value = (currentTime / duration) * 100;
            let min = Math.floor(currentTime / 60);
            let sec = Math.floor(currentTime % 60);
            if (sec < 10) sec = `0${sec}`;
            currTime.innerText = `${min}:${sec}`;
        }
    });

    progressBar.addEventListener('input', () => {
        mainAudio.currentTime = (progressBar.value / 100) * mainAudio.duration;
    });

    mainAudio.addEventListener('ended', () => {
        currentMixIndex = (currentMixIndex + 1) % mixes.length;
        window.loadAndPlay(currentMixIndex);
    });
});