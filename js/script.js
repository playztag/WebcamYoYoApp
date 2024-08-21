let player;
let isMirrored = false;
let isDragging = false;
let startX, startY, startLeft, startTop;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '360',
        width: '640',
        videoId: 'dQw4w9WgXcQ', // Example video ID
        playerVars: {'autoplay': 0, 'controls': 1},
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube player is ready');
    setupWebcamDragging();
}

function setupWebcamDragging() {
    const webcamFeed = document.getElementById('webcam-feed');
    
    webcamFeed.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
    
    // Touch events for mobile devices
    webcamFeed.addEventListener('touchstart', startDragging);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', stopDragging);
}

function startDragging(e) {
    isDragging = true;
    const webcamFeed = document.getElementById('webcam-feed');
    
    if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    } else {
        startX = e.clientX;
        startY = e.clientY;
    }
    
    startLeft = parseInt(window.getComputedStyle(webcamFeed).left);
    startTop = parseInt(window.getComputedStyle(webcamFeed).top);
    
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    
    const webcamFeed = document.getElementById('webcam-feed');
    const videoContainer = document.querySelector('.video-container');
    let clientX, clientY;
    
    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    let newLeft = startLeft + clientX - startX;
    let newTop = startTop + clientY - startY;
    
    // Constrain within video container
    newLeft = Math.max(0, Math.min(newLeft, videoContainer.offsetWidth - webcamFeed.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, videoContainer.offsetHeight - webcamFeed.offsetHeight));
    
    webcamFeed.style.left = newLeft + 'px';
    webcamFeed.style.top = newTop + 'px';
    
    e.preventDefault();
}

function stopDragging() {
    isDragging = false;
}

function playVideo() {
    if (player && player.playVideo) {
        player.playVideo();
    }
}

function pauseVideo() {
    if (player && player.pauseVideo) {
        player.pauseVideo();
    }
}

function stopVideo() {
    if (player && player.stopVideo) {
        player.stopVideo();
    }
}

function loadNewVideo() {
    const videoIdInput = document.getElementById('video-id-input');
    const newVideoId = videoIdInput.value.trim();
    if (newVideoId && player && player.loadVideoById) {
        player.loadVideoById(newVideoId);
    } else {
        console.error('Invalid video ID or player not ready');
    }
}

function toggleMirror() {
    const webcamFeed = document.getElementById('webcam-feed');
    isMirrored = !isMirrored;
    webcamFeed.style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
}

function changePlaybackSpeed() {
    const speedSlider = document.getElementById('playback-speed');
    const speedValue = document.getElementById('speed-value');
    const newSpeed = parseFloat(speedSlider.value);
    if (player && player.setPlaybackRate) {
        player.setPlaybackRate(newSpeed);
        speedValue.textContent = newSpeed + 'x';
    }
}

function changeOpacity() {
    const opacityControl = document.getElementById('opacity-control');
    const opacityValue = document.getElementById('opacity-value');
    const webcamFeed = document.getElementById('webcam-feed');
    const newOpacity = parseFloat(opacityControl.value);
    
    webcamFeed.style.opacity = newOpacity;
    opacityValue.textContent = Math.round(newOpacity * 100) + '%';
}

// Initialize webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        const videoElement = document.getElementById('webcam-feed');
        videoElement.srcObject = stream;
    })
    .catch(error => console.error('Error accessing webcam:', error));

// Add event listener for playback speed changes
document.getElementById('playback-speed').addEventListener('input', function() {
    const speedValue = document.getElementById('speed-value');
    speedValue.textContent = this.value + 'x';
});

// Add event listener for opacity changes
document.getElementById('opacity-control').addEventListener('input', changeOpacity);