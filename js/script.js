let player;
let isMirrored = false;

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
    // Player is ready
    console.log('YouTube player is ready');
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