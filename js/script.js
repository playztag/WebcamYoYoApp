let player;
let isMirrored = false;
let isDragging = false;
let startX, startY, startLeft, startTop;
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
    setupWebcamDragging();
    initializeWebcam();
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
    
    startLeft = parseInt(webcamFeed.style.left) || 0;
    startTop = parseInt(webcamFeed.style.top) || 0;
    
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
    isMirrored = !isMirrored;
    applyWebcamTransform();
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

            // Set initial position
            videoElement.style.left = '10px';
            videoElement.style.top = '10px';
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