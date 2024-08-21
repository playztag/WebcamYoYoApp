// Initialize YouTube Player and Webcam Feed
function onYouTubeIframeAPIReady() {
    const player = new YT.Player('youtube-player', {
        height: '360',
        width: '640',
        videoId: 'VIDEO_ID', // Replace with your initial video ID
        playerVars: {'autoplay': 1, 'controls': 1},
    });
}

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    const videoElement = document.getElementById('webcam-feed');
    videoElement.srcObject = stream;
  })
  .catch(error => console.error('Error accessing webcam:', error));
