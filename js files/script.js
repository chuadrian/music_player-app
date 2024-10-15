const content = document.querySelector(".content");
const playImage = content.querySelector(".music-img img");
const musicName = content.querySelector(".music-titles .name");
const musicArtist = content.querySelector(".music-titles .artist");
const audio = document.querySelector(".main-song");
const playBtn = content.querySelector(".play-pause");
const playBtnIcon = content.querySelector(".play-pause span");
const prevBtn = content.querySelector("#prev");
const nextBtn = content.querySelector("#next");
const progressBar = content.querySelector(".prg-bar");
const progressDetails = content.querySelector(".prg-details");
const repeatBtn = content.querySelector("#repeat");
const shuffleBtn = content.querySelector("#shuffle");
const loadingSpinner = document.getElementById("loading-spinner");
const moreOptions = document.getElementById("more-options");
const lyricsModal = document.getElementById("lyrics-modal");
const closeBtn = document.querySelector(".close-btn");
const songLyricsElement = document.getElementById("song-lyrics");
const volumeControl = document.getElementById("volume-control");

// State variables
let currentIndex = 0;
let isRepeat = false;
let isShuffle = false;
let shuffledIndexes = [];

// Preload next audio
const nextAudio = new Audio();

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePlayer);
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", () => changeSong('next'));
prevBtn.addEventListener("click", () => changeSong('prev'));
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", handleSongEnd);
progressDetails.addEventListener("click", seek);
repeatBtn.addEventListener("click", toggleRepeat);
shuffleBtn.addEventListener("click", toggleShuffle);
moreOptions.addEventListener("click", showLyrics);
closeBtn.addEventListener("click", hideLyrics);
volumeControl.addEventListener("input", adjustVolume);

// Initialize player
function initializePlayer() {
    loadSavedState();
    loadData(currentIndex);
    pauseSong();
    preloadNextAudio(currentIndex);
}

// Load song data
function loadData(index) {
    showLoadingSpinner();
    const song = songs[index];
    musicName.textContent = song.name;
    musicArtist.textContent = song.artist;
    playImage.src = `images/${song.img}.jpg`;
    audio.src = `music/${song.audio}.mp3`;
    songLyricsElement.textContent = song.lyrics;

    audio.addEventListener('canplaythrough', hideLoadingSpinner, { once: true });
    audio.addEventListener('error', handleAudioError);
}

// Play and Pause functions
function playSong() {
    content.classList.add("paused");
    playBtnIcon.textContent = "pause";
    audio.play().catch(handleAudioError);
}

function pauseSong() {
    content.classList.remove("paused");
    playBtnIcon.textContent = "play_arrow";
    audio.pause();
}

function togglePlay() {
    const isMusicPaused = content.classList.contains("paused");
    isMusicPaused ? pauseSong() : playSong();
}

// Change song (next or previous)
function changeSong(direction) {
    if (direction === 'next') {
        currentIndex = isShuffle ? getShuffledIndex() : (currentIndex + 1) % songs.length;
    } else {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    }
    loadData(currentIndex);
    playSong();
    saveCurrentState();
}

// Update progress bar
function updateProgress(e) {
    const { currentTime, duration } = e.target;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    updateCurrentTime(currentTime);
}

// Seek functionality
function seek(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

// Toggle repeat
function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active", isRepeat);
    audio.loop = isRepeat;
}

// Toggle shuffle
function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    if (isShuffle) {
        generateShuffleIndexes();
    }
}

// Handle song end
function handleSongEnd() {
    if (!isRepeat) {
        changeSong('next');
    }
}

// Show loading spinner
function showLoadingSpinner() {
    loadingSpinner.style.display = "block";
}

// Hide loading spinner
function hideLoadingSpinner() {
    loadingSpinner.style.display = "none";
}

// Generate shuffled indexes
function generateShuffleIndexes() {
    shuffledIndexes = Array.from({ length: songs.length }, (_, i) => i)
        .filter(i => i !== currentIndex)
        .sort(() => Math.random() - 0.5);
}

// Get next shuffled index
function getShuffledIndex() {
    if (shuffledIndexes.length === 0) {
        generateShuffleIndexes();
    }
    return shuffledIndexes.pop();
}

// Show lyrics
function showLyrics() {
    lyricsModal.style.display = "block";
}

// Hide lyrics
function hideLyrics() {
    lyricsModal.style.display = "none";
}

// Format time
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

// Update current time display
function updateCurrentTime(time) {
    const currentTimeElement = content.querySelector(".current");
    currentTimeElement.textContent = formatTime(time);
}

// Preload next audio
function preloadNextAudio(currentIndex) {
    const nextIndex = (currentIndex + 1) % songs.length;
    nextAudio.src = `music/${songs[nextIndex].audio}.mp3`;
    nextAudio.load();
}

// Save current state to local storage
function saveCurrentState() {
    localStorage.setItem('currentSongIndex', currentIndex);
    localStorage.setItem('currentTime', audio.currentTime);
}

// Load saved state from local storage
function loadSavedState() {
    const savedIndex = localStorage.getItem('currentSongIndex');
    const savedTime = localStorage.getItem('currentTime');
    if (savedIndex !== null) {
        currentIndex = parseInt(savedIndex, 10);
        if (savedTime !== null) {
            audio.currentTime = parseFloat(savedTime);
        }
    }
}

// Adjust volume
function adjustVolume() {
    audio.volume = volumeControl.value;
}

// Handle audio error
function handleAudioError(error) {
    console.error("Error playing audio:", error);
    alert("There was an error playing the audio. Please try again.");
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowRight':
            changeSong('next');
            break;
        case 'ArrowLeft':
            changeSong('prev');
            break;
    }
});
