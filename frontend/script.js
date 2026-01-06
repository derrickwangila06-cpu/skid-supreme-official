document.addEventListener("DOMContentLoaded", () => {
    
    // DOM ELEMENTS
    const loadingScreen = document.getElementById('loading');
    const mixFeed = document.getElementById('mix-feed');
    const eventsList = document.getElementById('events-list'); // For Gigs
    const masterPlayer = document.getElementById('master-player');
    const mainAudio = document.getElementById('main-audio');
    
    // Player Elements
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

    // --- 1. FETCH DATA (MIXES & GIGS) ---
    Promise.all([
        fetch('/api/mixes').then(res => res.json()),
        fetch('/api/gigs').then(res => res.json())
    ]).then(([mixData, gigData]) => {
        
        // Handle Mixes
        mixes = mixData;
        loadingScreen.style.display = 'none';
        if (mixes.length > 0) renderMixes(mixes);
        else mixFeed.innerHTML = '<p style="text-align:center; color:#666;">No mixes yet.</p>';

        // Handle Gigs
        if (gigData.length > 0) renderGigs(gigData);
        else eventsList.innerHTML = '<p style="color:#666;">No upcoming dates announced.</p>';

    }).catch(err => console.error("Error loading content:", err));

    // --- 2. RENDER FUNCTIONS ---
    function renderMixes(list) {
        mixFeed.innerHTML = '';
        list.forEach((mix, index) => {
            const imageSrc = mix.coverArt || 'logo.jpg';
            const card = document.createElement('div');
            card.classList.add('mix-card');
            card.innerHTML = `
                <div class="card-image" style="background-image: url('${imageSrc}')">
                    <button class="card-play-btn" onclick="loadAndPlay(${index})"><i class="fas fa-play"></i></button>
                </div>
                <div class="card-info">
                    <h3>${mix.title}</h3>
                    <p>${mix.description}</p>
                    <div class="card-stats">
                        <span><i class="fas fa-download"></i> ${mix.downloads}</span>
                        <button class="share-btn"><i class="fas fa-share-alt"></i></button>
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
            // We can add a class here if we want specific styling later
            gigItem.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:15px; margin-bottom:10px; border-radius:8px; border-left: 3px solid #ff0055;";
            
            gigItem.innerHTML = `
                <div>
                    <h4 style="margin:0; font-size:18px; color:white;">${gig.date}</h4>
                    <p style="margin:5px 0 0; color:#888; font-size:14px;">${gig.venue}, ${gig.location}</p>
                </div>
                <a href="${gig.ticketLink}" target="_blank" class="cta-btn" style="margin-top:0; padding:8px 20px; font-size:12px;">Tickets</a>
            `;
            eventsList.appendChild(gigItem);
        });
    }

    // --- 3. PLAYER FUNCTIONS ---
    window.loadAndPlay = (index) => {
        currentMixIndex = index;
        const mix = mixes[index];
        playerTitle.innerText = mix.title;
        playerImg.src = mix.coverArt || 'logo.jpg';
        mainAudio.src = mix.audioLink;
        downloadLink.href = mix.audioLink;
        
        // Update download count
        fetch(`/api/mixes/${mix._id}/download`, { method: 'POST' });

        masterPlayer.classList.remove('player-hidden');
        playSong();
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

    // Event Listeners
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
});