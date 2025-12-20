document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Load
    if(document.getElementById('mix-feed')) fetchMixes();
    if(document.getElementById('events-list')) fetchEvents();
});

// --- VARIABLES ---
const masterPlayer = document.getElementById('master-player');
const mainAudio = document.getElementById('main-audio');
const playBtn = document.getElementById('playBtn');
// Remove "http://localhost:5000" and rely on relative path
const fixPath = (path) => path.replace(/\\/g, '/');
let isPlaying = false;

// --- FETCH MIXES ---
async function fetchMixes() {
    try {
        // CHANGED: Removed localhost, now uses relative path '/api/mixes'
        const res = await fetch('/api/mixes');
        const mixes = await res.json();
        const container = document.getElementById('mix-feed');
        if(document.getElementById('loading')) document.getElementById('loading').style.display = 'none';

        mixes.forEach(mix => {
            const card = document.createElement('div');
            card.className = 'mix-card';
            // CHANGED: Relative path for images
            const img = `/${fixPath(mix.coverImage)}`;
            const audio = `/${fixPath(mix.audioUrl)}`;
            
            card.innerHTML = `
                <div class="play-overlay"><i class="fas fa-play-circle card-play-btn"></i></div>
                <img src="${img}" class="card-image">
                <div class="card-content">
                    <span class="genre-tag">${mix.genre}</span>
                    <h3>${mix.title}</h3>
                </div>
            `;
            card.addEventListener('click', () => loadTrack(mix, img, audio));
            container.appendChild(card);
        });
    } catch (e) { console.error(e); }
}

// --- FETCH EVENTS ---
async function fetchEvents() {
    try {
        // CHANGED: Relative path
        const res = await fetch('/api/events');
        const events = await res.json();
        const container = document.getElementById('events-list');
        container.innerHTML = '';

        if(events.length === 0) { container.innerHTML = '<p style="color:#666; font-style:italic;">No upcoming gigs announced yet.</p>'; return; }

        events.forEach(event => {
            const div = document.createElement('div');
            div.className = `event-card ${event.status === 'Sold Out' ? 'sold-out' : ''}`;
            // CHANGED: Relative path
            const imgUrl = `/${fixPath(event.image)}`; 
            
            div.innerHTML = `
                <img src="${imgUrl}" class="event-cover" alt="Event Flyer">
                <div class="event-info">
                    <div class="event-date">${event.date}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-venue"><i class="fas fa-map-marker-alt"></i> ${event.venue}</div>
                </div>
                ${event.status === 'Sold Out' ? '<span class="sold-out-badge">SOLD OUT</span>' : '<a href="#" class="event-btn">Get Tickets</a>'}
            `;
            container.appendChild(div);
        });
    } catch(e) { console.error(e); }
}

// --- PLAYER LOGIC ---
function loadTrack(mix, img, audio) {
    masterPlayer.classList.add('active');
    document.getElementById('player-img').src = img;
    document.getElementById('player-title').innerText = mix.title;
    document.getElementById('player-desc').innerText = mix.description;
    
    mainAudio.src = audio; 
    playTrack();
}

function playTrack() {
    mainAudio.play();
    isPlaying = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseTrack() {
    mainAudio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

if(playBtn) {
    playBtn.addEventListener('click', () => {
        isPlaying ? pauseTrack() : playTrack();
    });
}

// Progress Bar
if(mainAudio) {
    mainAudio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.srcElement;
        if(isNaN(duration)) return;
        if(document.getElementById('progressBar')) {
            document.getElementById('progressBar').value = (currentTime / duration) * 100;
        }
        
        let min = Math.floor(currentTime / 60);
        let sec = Math.floor(currentTime % 60);
        if(sec < 10) sec = `0${sec}`;
        if(document.getElementById('currTime')) {
            document.getElementById('currTime').innerText = `${min}:${sec}`;
        }
    });
}

if(document.getElementById('progressBar')) {
    document.getElementById('progressBar').addEventListener('input', () => {
        mainAudio.currentTime = (document.getElementById('progressBar').value * mainAudio.duration) / 100;
    });
}

// --- BOOKING FORM ---
const bookingForm = document.getElementById('bookingForm');
if(bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('.submit-btn');
        const originalText = btn.innerText;
        btn.innerText = "Sending Request...";
        btn.disabled = true;

        const payload = {
            clientName: document.getElementById('clientName').value,
            email: document.getElementById('clientEmail').value,
            eventType: document.getElementById('eventType').value,
            details: document.getElementById('eventDetails').value
        };

        try {
            // CHANGED: Relative path
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ Success: " + data.message);
                bookingForm.reset();
            } else {
                alert("❌ Error: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Connection Error.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}