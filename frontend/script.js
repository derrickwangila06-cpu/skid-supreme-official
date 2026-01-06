document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. DOM ELEMENTS SELECTION
    // ==========================================
    const loadingScreen = document.getElementById('loading');
    const mixFeed = document.getElementById('mix-feed');
    const eventsList = document.getElementById('events-list'); // For the Gigs
    
    // Player DOM Elements
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

    // State Variables
    let mixes = [];
    let isPlaying = false;
    let currentMixIndex = 0;

    // ==========================================
    // 2. FETCH REAL DATA (MIXES & GIGS)
    // ==========================================
    
    // We use Promise.all to fetch both lists at the same time
    Promise.all([
        fetch('/api/mixes').then(res => res.json()),
        fetch('/api/gigs').then(res => res.json())
    ]).then(([mixData, gigData]) => {
        
        // --- HANDLE MIXES ---
        mixes = mixData;
        loadingScreen.style.display = 'none'; // Hide loader
        
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
        loadingScreen.innerHTML = '<p style="color:red;">System Error: Could not load data.</p>';
    });

    // ==========================================
    // 3. RENDER FUNCTIONS (DISPLAY TO SCREEN)
    // ==========================================

    function renderMixes(list) {
        mixFeed.innerHTML = ''; // Clear existing content
        
        list.forEach((mix, index) => {
            // Handle image: Use uploaded link OR default 'logo.jpg'
            const imageSrc = mix.coverArt || 'logo.jpg';
            
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
        eventsList.innerHTML = ''; // Clear loading text
        
        list.forEach(gig => {
            const gigItem = document.createElement('div');
            // Inline styles for quick layout (matches the dark theme)
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
    // 4. PLAYER LOGIC (THE BRAIN)
    // ==========================================
    
    // Attach function to window so HTML can access it
    window.loadAndPlay = (index) => {
        currentMixIndex = index;
        const mix = mixes[index];

        // Update UI
        playerTitle.innerText = mix.title;
        playerImg.src = mix.coverArt || 'logo.jpg';
        
        // Set Audio Source
        mainAudio.src = mix.audioLink;
        downloadLink.href = mix.audioLink;
        
        // Trigger Download Count Update in Background
        updateDownloadCount(mix._id);

        // Show Player Footer
        masterPlayer.classList.remove('player-hidden');
        
        // Start Playing
        playSong();
    };

    function updateDownloadCount(id) {
        // Send a signal to backend to add +1 to downloads
        fetch(`/api/mixes/${id}/download`, { method: 'POST' })
            .catch(err => console.error("Count Error", err));
    }

    // Share Functionality (Restored!)
    window.shareMix = (title) => {
        if (navigator.share) {
            navigator.share({
                title: 'DJ SKID SUPREME',
                text: `Check out this mix: ${title}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            alert("Link copied to clipboard! Share it with your friends.");
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

    // ==========================================
    // 5. EVENT LISTENERS (CONTROLS)
    // ==========================================
    
    // Play/Pause Toggle
    playBtn.addEventListener('click', () => {
        if (isPlaying) pauseSong();
        else playSong();
    });

    // Next Button
    nextBtn.addEventListener('click', () => {
        // Go to next index, wrap around if at the end
        currentMixIndex = (currentMixIndex + 1) % mixes.length;
        window.loadAndPlay(currentMixIndex);
    });

    // Previous Button
    prevBtn.addEventListener('click', () => {
        // Go to prev index, wrap around if at the start
        currentMixIndex = (currentMixIndex - 1 + mixes.length) % mixes.length;
        window.loadAndPlay(currentMixIndex);
    });

    // Progress Bar (Time Update)
    mainAudio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.srcElement;
        if (duration) {
            // Update Slider
            const progressPercent = (currentTime / duration) * 100;
            progressBar.value = progressPercent;
            
            // Update Time Text (0:00)
            let min = Math.floor(currentTime / 60);
            let sec = Math.floor(currentTime % 60);
            if (sec < 10) sec = `0${sec}`;
            currTime.innerText = `${min}:${sec}`;
        }
    });

    // Seek (Clicking the bar)
    progressBar.addEventListener('input', () => {
        const duration = mainAudio.duration;
        mainAudio.currentTime = (progressBar.value / 100) * duration;
    });

    // Auto-play next song when one ends
    mainAudio.addEventListener('ended', () => {
        currentMixIndex = (currentMixIndex + 1) % mixes.length;
        window.loadAndPlay(currentMixIndex);
    });
});