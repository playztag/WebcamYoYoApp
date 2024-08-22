// Constants for element IDs
const ELEMENTS = {
    YOUTUBE_PLAYER: 'youtube-player',
    WEBCAM_FEED: 'webcam-feed',
    OUTPUT_CANVAS: 'output-canvas',
    PLAY_PAUSE_BTN: 'play-pause-btn',
    MIRROR_WEBCAM_BTN: 'mirror-webcam-btn',
    MIRROR_YOUTUBE_BTN: 'mirror-youtube-btn',
    REMOVE_BACKGROUND_BTN: 'remove-background-btn',
    OPACITY_CONTROL: 'opacity-control',
    OPACITY_VALUE: 'opacity-value',
    YOUTUBE_SCALE: 'youtube-scale',
    WEBCAM_SCALE: 'webcam-scale',
    SPEED_VALUE: 'speed-value',
    VIDEO_ID_INPUT: 'video-id-input',
    YOUTUBE_SCALE_VALUE: 'youtube-scale-value',
    WEBCAM_SCALE_VALUE: 'webcam-scale-value',
    PLAYBACK_SPEED: 'playback-speed'
};

// Global variables
let player;
let bodyPixNet;
let webcamStream;
let isWebcamMirrored = true;
let isYoutubeMirrored = true;
let isFullscreen = false;
let isBackgroundRemoved = false;

// Initialization
function onYouTubeIframeAPIReady() {
    player = new YT.Player(ELEMENTS.YOUTUBE_PLAYER, {
        height: '720',
        width: '1280',
        videoId: 'dQw4w9WgXcQ',
        playerVars: {
            'autoplay': 0,
            'controls': 1,
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube player is ready');
    initializeWebcam();
    setupKeyboardControls();
    applyYoutubeTransform();
    updateOverlayControls();
}

async function initializeWebcam() {
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.getElementById(ELEMENTS.WEBCAM_FEED);
        videoElement.srcObject = webcamStream;
        
        setInitialOpacity();
        applyWebcamTransform();

        // Initialize BodyPix
        bodyPixNet = await bodyPix.load();
        segmentBodyInRealTime();
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
}

// YouTube functions
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
    const videoIdInput = document.getElementById(ELEMENTS.VIDEO_ID_INPUT);
    const newVideoId = videoIdInput.value.trim();
    if (newVideoId && player && player.loadVideoById) {
        player.loadVideoById(newVideoId);
    } else {
        console.error('Invalid video ID or player not ready');
    }
}

function toggleYoutubeMirror() {
    isYoutubeMirrored = !isYoutubeMirrored;
    applyYoutubeTransform();
    updateOverlayControls();
}

function applyYoutubeTransform() {
    const youtubePlayer = document.getElementById(ELEMENTS.YOUTUBE_PLAYER);
    const youtubeScale = document.getElementById(ELEMENTS.YOUTUBE_SCALE);
    const newScale = parseFloat(youtubeScale.value);
    
    youtubePlayer.style.transform = `scale(${newScale})${isYoutubeMirrored ? ' scaleX(-1)' : ''}`;
}

// Webcam functions
function toggleWebcamMirror() {
    isWebcamMirrored = !isWebcamMirrored;
    applyWebcamTransform();
    updateOverlayControls();
}

function applyWebcamTransform() {
    const webcamFeed = document.getElementById(ELEMENTS.WEBCAM_FEED);
    const webcamScale = document.getElementById(ELEMENTS.WEBCAM_SCALE);
    const newScale = parseFloat(webcamScale.value);
    
    webcamFeed.style.transform = `scale(${newScale})${isWebcamMirrored ? ' scaleX(-1)' : ''}`;
}

function setInitialOpacity() {
    const opacityControl = document.getElementById(ELEMENTS.OPACITY_CONTROL);
    const opacityValue = document.getElementById(ELEMENTS.OPACITY_VALUE);
    const videoElement = document.getElementById(ELEMENTS.WEBCAM_FEED);
    
    videoElement.style.opacity = opacityControl.value;
    opacityValue.textContent = Math.round(opacityControl.value * 100) + '%';
}

// Background removal functions
async function segmentBodyInRealTime() {
    const videoElement = document.getElementById(ELEMENTS.WEBCAM_FEED);
    const canvas = document.getElementById(ELEMENTS.OUTPUT_CANVAS);
    const ctx = canvas.getContext('2d');

    async function segmentAndRender() {
        if (isBackgroundRemoved) {
            const segmentation = await bodyPixNet.segmentPerson(videoElement);
            const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
            const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
            const bodyPixMask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(bodyPixMask, 0, 0);
            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        requestAnimationFrame(segmentAndRender);
    }

    segmentAndRender();
}

function toggleBackgroundRemoval() {
    isBackgroundRemoved = !isBackgroundRemoved;
    const canvas = document.getElementById(ELEMENTS.OUTPUT_CANVAS);
    const videoElement = document.getElementById(ELEMENTS.WEBCAM_FEED);

    if (isBackgroundRemoved) {
        canvas.style.display = 'block';
        videoElement.style.display = 'none';
    } else {
        canvas.style.display = 'none';
        videoElement.style.display = 'block';
    }

    updateOverlayControls();
}

// UI update functions
function updateOverlayControls() {
    const playPauseBtn = document.getElementById(ELEMENTS.PLAY_PAUSE_BTN);
    playPauseBtn.textContent = player.getPlayerState() === YT.PlayerState.PLAYING ? 'Pause (Space)' : 'Play (Space)';

    const mirrorWebcamBtn = document.getElementById(ELEMENTS.MIRROR_WEBCAM_BTN);
    mirrorWebcamBtn.textContent = `${isWebcamMirrored ? 'Unmirror' : 'Mirror'} Webcam (M)`;

    const mirrorYoutubeBtn = document.getElementById(ELEMENTS.MIRROR_YOUTUBE_BTN);
    mirrorYoutubeBtn.textContent = `${isYoutubeMirrored ? 'Unmirror' : 'Mirror'} YouTube (Y)`;

    const removeBackgroundBtn = document.getElementById(ELEMENTS.REMOVE_BACKGROUND_BTN);
    removeBackgroundBtn.textContent = `${isBackgroundRemoved ? 'Show' : 'Remove'} Background`;

    const speedValue = document.getElementById(ELEMENTS.SPEED_VALUE);
    speedValue.textContent = player.getPlaybackRate() + 'x';
}

// Additional functions
function changePlaybackSpeed(increase = true) {
    const speedSlider = document.getElementById(ELEMENTS.PLAYBACK_SPEED);
    let newSpeed = parseFloat(speedSlider.value);
    if (increase) {
        newSpeed = Math.min(newSpeed + 0.25, 2); // max speed 2x
    } else {
        newSpeed = Math.max(newSpeed - 0.25, 0.25); // min speed 0.25x
    }
    speedSlider.value = newSpeed;
    const speedValue = document.getElementById(ELEMENTS.SPEED_VALUE);
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
    const opacityControl = document.getElementById(ELEMENTS.OPACITY_CONTROL);
    const opacityValue = document.getElementById(ELEMENTS.OPACITY_VALUE);
    const webcamFeed = document.getElementById(ELEMENTS.WEBCAM_FEED);
    const newOpacity = parseFloat(opacityControl.value);
    
    webcamFeed.style.opacity = newOpacity;
    opacityValue.textContent = Math.round(newOpacity * 100) + '%';
}

function changeYouTubeScale() {
    const youtubeScale = document.getElementById(ELEMENTS.YOUTUBE_SCALE);
    const youtubeScaleValue = document.getElementById(ELEMENTS.YOUTUBE_SCALE_VALUE);
    const newScale = parseFloat(youtubeScale.value);
    
    youtubeScaleValue.textContent = Math.round(newScale * 100) + '%';
    applyYoutubeTransform();
}

function changeWebcamScale() {
    const webcamScale = document.getElementById(ELEMENTS.WEBCAM_SCALE);
    const webcamScaleValue = document.getElementById(ELEMENTS.WEBCAM_SCALE_VALUE);
    const newScale = parseFloat(webcamScale.value);
    
    webcamScaleValue.textContent = Math.round(newScale * 100) + '%';
    applyWebcamTransform();
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
    
    isFullscreen = !isFullscreen;
    updateOverlayControls();
}

// Keyboard controls
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
            case 'b': // 'b' for toggle background removal
                toggleBackgroundRemoval();
                break;
            default:
                break;
        }
    });
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeWebcam();
    document.getElementById(ELEMENTS.PLAYBACK_SPEED).addEventListener('input', changePlaybackSpeed);
    document.getElementById(ELEMENTS.OPACITY_CONTROL).addEventListener('input', changeOpacity);
    document.getElementById(ELEMENTS.YOUTUBE_SCALE).addEventListener('input', changeYouTubeScale);
    document.getElementById(ELEMENTS.WEBCAM_SCALE).addEventListener('input', changeWebcamScale);
});

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