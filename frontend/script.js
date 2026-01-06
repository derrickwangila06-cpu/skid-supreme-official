document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. DOM ELEMENTS ---
    const loadingScreen = document.getElementById('loading');
    const mixFeed = document.getElementById('mix-feed');
    const masterPlayer = document.getElementById('master-player');
    const mainAudio = document.getElementById('main-audio');
    
    // Player Controls
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const currTime = document.getElementById('currTime');
    const playerTitle = document.getElementById('player-title');
    const playerImg = document.getElementById('player-img');
    const downloadLink = document.getElementById('downloadLink');

    let mixes = []; // This will hold the Real Data
    let isPlaying = false;
    let currentMixIndex = 0;

    // --- 2. FETCH REAL DATA FROM DATABASE ---
    fetch('/api/mixes')
        .then(response => response.json())
        .then(data => {
            mixes = data; // Store the real mixes
            
            // Hide loader
            loadingScreen.style.display = 'none';
            
            if (mixes.length === 0) {
                mixFeed.innerHTML = '<p style="text-align:center; color:#666;">No mixes found. Upload one in the Admin Dashboard!</p>';
            } else {
                renderMixes(mixes);
            }
        })
        .catch(error => {
            console.error('Error fetching mixes:', error);
            loadingScreen.innerHTML = '<p style="color:red;">Error loading music. Please refresh.</p>';
        });

    // --- 3. RENDER MIX CARDS ---
    function renderMixes(mixList) {
        mixFeed.innerHTML = '';
        
        mixList.forEach((mix, index) => {
            // Check if coverArt is a full link or a local file
            const imageSrc = mix.coverArt.startsWith('http') ? mix.coverArt : mix.coverArt;
            
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
                        <button class="share-btn" onclick="shareMix('${mix.title}')"><i class="fas fa-share-alt"></i></button>
                    </div>
                </div>
            `;
            mixFeed.appendChild(card);
        });
    }

    // --- 4. PLAYER FUNCTIONS ---
    
    window.loadAndPlay = (index) => {
        currentMixIndex = index;
        const mix = mixes[index];

        // Update Player UI
        playerTitle.innerText = mix.title;
        // Handle image source (link vs local)
        playerImg.src = mix.coverArt.startsWith('http') ? mix.coverArt : mix.coverArt;
        
        mainAudio.src = mix.audioLink; // Use 'audioLink' from DB
        downloadLink.href = mix.audioLink;
        
        // Increase Download Count in Background
        updateDownloadCount(mix._id);

        // Show Player
        masterPlayer.classList.remove('player-hidden');
        
        playSong();
    };

    function updateDownloadCount(id) {
        fetch(`/api/mixes/${id}/download`, { method: 'POST' })
            .catch(err => console.error("Count Error", err));
    }

    window.shareMix = (title) => {
        if (navigator.share) {
            navigator.share({
                title: 'DJ SKID SUPREME',
                text: `Check out this mix: ${title}`,
                url: window.location.href
            });
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

    // --- 5. EVENT LISTENERS ---
    
    playBtn.addEventListener('click', () => {
        if (isPlaying) pauseSong();
        else playSong();
    });

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
            const progressPercent = (currentTime / duration) * 100;
            progressBar.value = progressPercent;
            
            let min = Math.floor(currentTime / 60);
            let sec = Math.floor(currentTime % 60);
            if (sec < 10) sec = `0${sec}`;
            currTime.innerText = `${min}:${sec}`;
        }
    });

    progressBar.addEventListener('input', () => {
        const duration = mainAudio.duration;
        mainAudio.currentTime = (progressBar.value / 100) * duration;
    });
});