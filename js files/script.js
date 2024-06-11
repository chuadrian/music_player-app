
const content = document.querySelector(".content"),
    playImage = content.querySelector(".music-img img"),
    musicName = content.querySelector(".music-titles .name"),
    musicArtist = content.querySelector(".music-titles .artist"),
    audio = document.querySelector(".main-song"),
    playBtn = content.querySelector(".play-pause"),
    playBtnIcon = content.querySelector(".play-pause span"),
    prevBtn = content.querySelector("#prev"),
    nextBtn = content.querySelector("#next"),
    progressBar = content.querySelector(".prg-bar"),
    progressDetails = content.querySelector(".prg-details"),
    repeatBtn = content.querySelector("#repeat"),
    shuffleBtn = content.querySelector("#shuffle"),
    loadingSpinner = document.getElementById("loading-spinner");
    moreOptions = document.getElementById("more-options");
    lyricsModal = document.getElementById("lyrics-modal");
    closeBtn = document.querySelector(".close-btn");
    songLyricsElement = document.getElementById("song-lyrics");

let index = 0;
let isRepeat = false;
let isShuffle = false;
let nextAudio = new Audio();
let shuffledIndexes = [];

window.addEventListener("load", () => {
    loadData(index);
    pauseSong(); // pauses the first song on load
    preloadNextAudio(index);
});

function loadData(indexValue) {
    showLoadingSpinner();
    musicName.innerText = songs[indexValue].name;
    musicArtist.innerText = songs[indexValue].artist;
    playImage.src = "images/" + songs[indexValue].img + ".jpg";
    audio.src = "music/" + songs[indexValue].audio + ".mp3";
    audio.preload = "metadata";
    audio.load();
    preloadNextAudio(indexValue);
    audio.addEventListener('canplaythrough', hideLoadingSpinner, { once: true });
}

playBtn.addEventListener("click", () => {
    const isMusicPaused = content.classList.contains("paused");
    if (isMusicPaused) {
        pauseSong();
    } else {
        playSong();
    }
});

function playSong() {
    content.classList.add("paused");
    playBtnIcon.innerText = "pause";
    audio.play().catch(error => {
        console.error("Error playing audio:", error);
        // this is optional : Display an error message to the user
    });
}

function pauseSong() {
    content.classList.remove("paused");
    playBtnIcon.innerText = "play_arrow";
    audio.pause();
}

nextBtn.addEventListener("click", () => {
    nextSong();
});

function nextSong() {
    if (isShuffle) {
        index = shuffledIndexes.pop();
        if (shuffledIndexes.length === 0) {
            generateShuffleIndexes();
        }
    } else {
        index++;
        if (index >= songs.length) {
            index = 0;
        }
    }
    loadData(index);
    playSong();
}

prevBtn.addEventListener("click", () => {
    prevSong();
});

function prevSong() {
    index--;
    if (index < 0) {
        index = songs.length - 1;
    }
    loadData(index);
    playSong();
}

audio.addEventListener("timeupdate", (e) => {
    const initialTime = e.target.currentTime;
    const finalTime = e.target.duration;
    let barWidth = (initialTime / finalTime) * 100;
    progressBar.style.width = barWidth + "%";

    updateCurrentTime(initialTime);
});

progressDetails.addEventListener("click", (e) => {
    let progressValue = progressDetails.clientWidth;
    let clickedOffsetX = e.offsetX;
    let musicDuration = audio.duration;

    audio.currentTime = (clickedOffsetX / progressValue) * musicDuration;
});

audio.addEventListener("loadedmetadata", () => {
    const finalTimeData = content.querySelector(".final");
    const audioDuration = formatTime(audio.duration);
    finalTimeData.innerText = audioDuration;
});

repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active", isRepeat);
    audio.loop = isRepeat;
});

shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    if (isShuffle) {
        generateShuffleIndexes();
    }
});

audio.addEventListener("ended", () => {
    if (!isRepeat) {
        nextSong();
    }
});

function updateCurrentTime(time) {
    const currentTimeData = content.querySelector(".current");
    currentTimeData.innerText = formatTime(time);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function preloadNextAudio(currentIndex) {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= songs.length) {
        nextIndex = 0;
    }
    nextAudio.src = "music/" + songs[nextIndex].audio + ".mp3";
    nextAudio.preload = "metadata";
    nextAudio.load(); // preloads the next audio file
}

function showLoadingSpinner() {
    loadingSpinner.style.display = "block";
}

function hideLoadingSpinner() {
    loadingSpinner.style.display = "none";
}

function generateShuffleIndexes() {
    shuffledIndexes = Array.from({ length: songs.length }, (_, i) => i).sort(() => Math.random() - 0.5);
    if (shuffledIndexes[shuffledIndexes.length - 1] === index) {
        shuffledIndexes.unshift(shuffledIndexes.pop());
    }
}

function showLyrics() {
    const currentSong = songs[index];
    songLyricsElement.innerText = currentSong.lyrics;
    lyricsModal.style.display = "block";
}

// Event listener for more options icon
moreOptions.addEventListener("click", showLyrics);

// Event listener for close button
closeBtn.addEventListener("click", () => {
    lyricsModal.style.display = "none";
});

// Close the modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target === lyricsModal) {
        lyricsModal.style.display = "none";
    }
});