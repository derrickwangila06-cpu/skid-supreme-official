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

    // --- 2. SAMPLE DATA (The "Demo" Mix) ---
    // Once we connect the backend, this will come from your database.
    const mixes = [
        {
            _id: "1",
            title: "Supreme Vibes Vol. 1 (2026 Intro)",
            description: "Afrobeat vs Amapiano - The Official Warmup",
            image: "logo.jpg", // Uses your logo as cover art for now
            audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Free sample audio
            downloads: 150
        },
        {
            _id: "2",
            title: "Late Night Drive",
            description: "HipHop & RnB Classics",
            image: "logo.jpg",
            audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            downloads: 85
        }
    ];

    let isPlaying = false;
    let currentMixIndex = 0;

    // --- 3. INITIALIZATION ---
    setTimeout(() => {
        // Hide loader after 1.5 seconds
        loadingScreen.style.display = 'none';
        renderMixes(mixes);
    }, 1500);

    // --- 4. RENDER MIX CARDS ---
    function renderMixes(mixList) {
        mixFeed.innerHTML = '';
        
        mixList.forEach((mix, index) => {
            const card = document.createElement('div');
            card.classList.add('mix-card');
            
            card.innerHTML = `
                <div class="card-image" style="background-image: url('${mix.image}')">
                    <button class="card-play-btn" onclick="loadAndPlay(${index})">
                        <i class="fas fa-play"></i>
                    </button>
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

    // --- 5. PLAYER FUNCTIONS ---
    
    // Expose this function to the window so HTML onclick works
    window.loadAndPlay = (index) => {
        currentMixIndex = index;
        const mix = mixes[index];

        // Update Player UI
        playerTitle.innerText = mix.title;
        playerImg.src = mix.image;
        mainAudio.src = mix.audio;
        downloadLink.href = mix.audio;

        // Show Player
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

    // --- 6. EVENT LISTENERS ---
    
    // Play/Pause Button
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    // Next / Prev
    nextBtn.addEventListener('click', () => {
        currentMixIndex = (currentMixIndex + 1) % mixes.length;
        window.loadAndPlay(currentMixIndex);
    });

    prevBtn.addEventListener('click', () => {
        currentMixIndex = (currentMixIndex - 1 + mixes.length) % mixes.length;
        window.loadAndPlay(currentMixIndex);
    });

    // Progress Bar Update
    mainAudio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.srcElement;
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            progressBar.value = progressPercent;
            
            // Calculate format 0:00
            let min = Math.floor(currentTime / 60);
            let sec = Math.floor(currentTime % 60);
            if (sec < 10) sec = `0${sec}`;
            currTime.innerText = `${min}:${sec}`;
        }
    });

    // Seek Functionality
    progressBar.addEventListener('input', () => {
        const duration = mainAudio.duration;
        mainAudio.currentTime = (progressBar.value / 100) * duration;
    });
});