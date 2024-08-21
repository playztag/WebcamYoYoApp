let player;
let isMirrored = false;
let isFullscreen = false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '720',
        width: '1280',
        videoId: 'dQw4w9WgXcQ', // Example video ID
        playerVars: {'autoplay': 0, 'controls': 1},
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube player is ready');
    initializeWebcam();
    setupKeyboardControls();
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
    isMirrored = !isMirrored;
    applyWebcamTransform();
}

function changePlaybackSpeed(increase = true) {
    const speedSlider = document.getElementById('playback-speed');
    let newSpeed = parseFloat(speedSlider.value);
    if (increase) {
        newSpeed = Math.min(newSpeed + 0.25, 2); // max speed 2x
    } else {
        newSpeed = Math.max(newSpeed - 0.25, 0.25); // min speed 0.25x
    }
    speedSlider.value = newSpeed;
    const speedValue = document.getElementById('speed-value');
    if (player && player.setPlaybackRate) {
        player.setPlaybackRate(newSpeed);
        speedValue.textContent = newSpeed + 'x';
    }
}

function advanceFrame(forward = true) {
    if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        player.seekTo(forward ? currentTime + 1 / 30 : currentTime - 1 / 30);
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

function changeYouTubeScale() {
    const youtubeScale = document.getElementById('youtube-scale');
    const youtubeScaleValue = document.getElementById('youtube-scale-value');
    const youtubePlayer = document.getElementById('youtube-player');
    const newScale = parseFloat(youtubeScale.value);
    
    youtubePlayer.style.transform = `scale(${newScale})`;
    youtubeScaleValue.textContent = Math.round(newScale * 100) + '%';
}

function changeWebcamScale() {
    const webcamScale = document.getElementById('webcam-scale');
    const webcamScaleValue = document.getElementById('webcam-scale-value');
    const newScale = parseFloat(webcamScale.value);
    
    webcamScaleValue.textContent = Math.round(newScale * 100) + '%';
    applyWebcamTransform();
}

function applyWebcamTransform() {
    const webcamFeed = document.getElementById('webcam-feed');
    const webcamScale = document.getElementById('webcam-scale');
    const newScale = parseFloat(webcamScale.value);
    
    webcamFeed.style.transform = `scale(${newScale})${isMirrored ? ' scaleX(-1)' : ''}`;
}

function initializeWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const videoElement = document.getElementById('webcam-feed');
            videoElement.srcObject = stream;
            
            // Set initial opacity
            const opacityControl = document.getElementById('opacity-control');
            const opacityValue = document.getElementById('opacity-value');
            videoElement.style.opacity = opacityControl.value;
            opacityValue.textContent = Math.round(opacityControl.value * 100) + '%';
        })
        .catch(error => console.error('Error accessing webcam:', error));
}

function toggleFullscreen() {
    const appContainer = document.querySelector('.app-container');
    const videoContainer = document.getElementById('video-container');
    
    if (!isFullscreen) {
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if (videoContainer.mozRequestFullScreen) { // Firefox
            videoContainer.mozRequestFullScreen();
        } else if (videoContainer.webkitRequestFullscreen) { // Chrome, Safari and Opera
            videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) { // IE/Edge
            videoContainer.msRequestFullscreen();
        }
        appContainer.classList.add('fullscreen');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
        appContainer.classList.remove('fullscreen');
    }
    
    isFullscreen = !isFullscreen;
    // Adjust player size for fullscreen
    setTimeout(() => {
        player.setSize(videoContainer.offsetWidth, videoContainer.offsetHeight);
    }, 100);
}

// Set up keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', function(event) {
        switch (event.key) {
            case ' ': // Spacebar for play/pause
                if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                    pauseVideo();
                } else {
                    playVideo();
                }
                break;
            case 'ArrowUp': // Arrow Up to increase speed
                changePlaybackSpeed(true);
                break;
            case 'ArrowDown': // Arrow Down to decrease speed
                changePlaybackSpeed(false);
                break;
            case 'ArrowRight': // Arrow Right to advance frame by frame
                advanceFrame(true);
                break;
            case 'ArrowLeft': // Arrow Left to reverse frame by frame
                advanceFrame(false);
                break;
            default:
                break;
        }
    });
}

// Add event listeners
document.getElementById('playback-speed').addEventListener('input', changePlaybackSpeed);
document.getElementById('opacity-control').addEventListener('input', changeOpacity);
document.getElementById('youtube-scale').addEventListener('input', changeYouTubeScale);
document.getElementById('webcam-scale').addEventListener('input', changeWebcamScale);

// Fullscreen change listener
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    const appContainer = document.querySelector('.app-container');
    const videoContainer = document.getElementById('video-container');
    
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        appContainer.classList.add('fullscreen');
        isFullscreen = true;
    } else {
        appContainer.classList.remove('fullscreen');
        isFullscreen = false;
    }
    
    // Adjust player size after fullscreen change
    setTimeout(() => {
        player.setSize(videoContainer.offsetWidth, videoContainer.offsetHeight);
    }, 100);
}
