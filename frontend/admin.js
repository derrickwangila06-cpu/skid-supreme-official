document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('loginMessage');

    // Check credentials
    if (username === "admin" && password === "skid2026") {
        message.style.color = "#00ff00";
        message.innerText = "Access Granted! Redirecting...";
        
        setTimeout(() => {
            // REDIRECT TO DASHBOARD
            window.location.href = "dashboard.html";
        }, 1000);
    } else {
        message.style.color = "red";
        message.innerText = "Access Denied. Invalid Credentials.";
    }
});