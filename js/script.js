let player;
let isWebcamMirrored = true;
let isYoutubeMirrored = true; // Set YouTube mirrored by default
let isFullscreen = false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '720',
        width: '1280',
        videoId: 'fmCD81mHbrc', // Example video ID
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
    applyYoutubeTransform(); // Apply default mirroring
    updateOverlayControls();
}

function playPauseVideo() {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        pauseVideo();
    } else {
        playVideo();
    }
    updateOverlayControls();
}

function playVideo() {
    if (player && player.playVideo) {
        player.playVideo();
    }
    updateOverlayControls();
}

function pauseVideo() {
    if (player && player.pauseVideo) {
        player.pauseVideo();
    }
    updateOverlayControls();
}

function stopVideo() {
    if (player && player.stopVideo) {
        player.stopVideo();
    }
    updateOverlayControls();
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

function toggleWebcamMirror() {
    isWebcamMirrored = !isWebcamMirrored;
    applyWebcamTransform();
    updateOverlayControls();
}

function toggleYoutubeMirror() {
    isYoutubeMirrored = !isYoutubeMirrored;
    applyYoutubeTransform();
    updateOverlayControls();
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
    updateOverlayControls();
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
    updateOverlayControls();
}

function changeYouTubeScale() {
    const youtubeScale = document.getElementById('youtube-scale');
    const youtubeScaleValue = document.getElementById('youtube-scale-value');
    const newScale = parseFloat(youtubeScale.value);
    
    youtubeScaleValue.textContent = Math.round(newScale * 100) + '%';
    applyYoutubeTransform();
    updateOverlayControls();
}

function changeWebcamScale() {
    const webcamScale = document.getElementById('webcam-scale');
    const webcamScaleValue = document.getElementById('webcam-scale-value');
    const newScale = parseFloat(webcamScale.value);
    
    webcamScaleValue.textContent = Math.round(newScale * 100) + '%';
    applyWebcamTransform();
    updateOverlayControls();
}

function applyWebcamTransform() {
    const webcamFeed = document.getElementById('webcam-feed');
    const webcamScale = document.getElementById('webcam-scale');
    const newScale = parseFloat(webcamScale.value);
    
    webcamFeed.style.transform = `scale(${newScale})${isWebcamMirrored ? ' scaleX(-1)' : ''}`;
}

function applyYoutubeTransform() {
    const youtubePlayer = document.getElementById('youtube-player');
    const youtubeScale = document.getElementById('youtube-scale');
    const newScale = parseFloat(youtubeScale.value);
    
    youtubePlayer.style.transform = `scale(${newScale})${isYoutubeMirrored ? ' scaleX(-1)' : ''}`;
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

            // Apply initial webcam transform (mirrored by default)
            applyWebcamTransform();
        })
        .catch(error => console.error('Error accessing webcam:', error));
}

function toggleFullscreen() {
    const appContainer = document.querySelector('.app-container');
    
    if (!isFullscreen) {
        if (appContainer.requestFullscreen) {
            appContainer.requestFullscreen();
        } else if (appContainer.mozRequestFullScreen) { // Firefox
            appContainer.mozRequestFullScreen();
        } else if (appContainer.webkitRequestFullscreen) { // Chrome, Safari and Opera
            appContainer.webkitRequestFullscreen();
        } else if (appContainer.msRequestFullscreen) { // IE/Edge
            appContainer.msRequestFullscreen();
        }
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
    }
}

function setupKeyboardControls() {
    document.addEventListener('keydown', function(event) {
        switch (event.key) {
            case ' ': // Spacebar for play/pause
                playPauseVideo();
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
            case 'm': // 'm' for mirror webcam
                toggleWebcamMirror();
                break;
            case 'y': // 'y' for mirror YouTube
                toggleYoutubeMirror();
                break;
            case 'f': // 'f' for fullscreen
                toggleFullscreen();
                break;
            default:
                break;
        }
    });
}

function updateOverlayControls() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.textContent = player.getPlayerState() === YT.PlayerState.PLAYING ? 'Pause (Space)' : 'Play (Space)';

    const mirrorWebcamBtn = document.getElementById('mirror-webcam-btn');
    mirrorWebcamBtn.textContent = `${isWebcamMirrored ? 'Unmirror' : 'Mirror'} Webcam (M)`;

    const mirrorYoutubeBtn = document.getElementById('mirror-youtube-btn');
    mirrorYoutubeBtn.textContent = `${isYoutubeMirrored ? 'Unmirror' : 'Mirror'} YouTube (Y)`;

    const speedValue = document.getElementById('speed-value');
    speedValue.textContent = player.getPlaybackRate() + 'x';
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
    
    isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    
    if (isFullscreen) {
        appContainer.classList.add('fullscreen');
    } else {
        appContainer.classList.remove('fullscreen');
    }
    
    // Adjust player size after fullscreen change
    setTimeout(() => {
        player.setSize(videoContainer.offsetWidth, videoContainer.offsetHeight);
    }, 100);

    updateOverlayControls();
}