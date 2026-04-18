const grid = document.getElementById("gridView");
const viewer = document.getElementById("viewer");
const viewerContainer = document.getElementById("viewerContainer");

let videosData = [];
let videoElements = [];
let observer;
let currentIndex = 0;
let globalMuted = false; // remember user's sound preference

/* ================= LOAD DATA ================= */

fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    videosData = data;
    loadGrid();
  });

function generateThumbnail(url) {
  return url
    .replace("/video/upload/", "/video/upload/so_2/")
    .replace(".mp4", ".jpg");
}

function cleanVideoUrl(url) {
  if (url.includes("f_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

/* ================= GRID ================= */

function loadGrid() {
  videosData.forEach((item, index) => {
    const thumbnail = generateThumbnail(item.video);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<img src="${thumbnail}" loading="lazy">`;

    card.onclick = () => openViewer(index);

    grid.appendChild(card);
  });
}

/* ================= VIEWER ================= */

function openViewer(startIndex) {

  currentIndex = startIndex;

  grid.style.display = "none";
  viewer.classList.remove("hidden");
  viewerContainer.innerHTML = "";

  videosData.forEach((item, index) => {

    const slide = document.createElement("div");
    slide.className = "videoSlide";

    const video = document.createElement("video");
    video.src = cleanVideoUrl(item.video);
    video.playsInline = true;
    video.preload = "metadata";
    video.muted = globalMuted;

    /* Tap play/pause */
    const overlay = document.createElement("div");
    overlay.className = "tapOverlay";
    overlay.onclick = () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    };

    /* ===== ACTION BAR ===== */

    const actionBar = document.createElement("div");
    actionBar.className = "actionBar";

    /* HEART */
    const heart = document.createElement("div");
    heart.className = "heartBtn";
    heart.innerHTML = `
      <svg viewBox="0 0 32 29">
        <path d="M23.6,0c-3.4,0-6.3,2-7.6,4.9C14.7,2,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4
        c0,9.2,16,20.6,16,20.6s16-11.4,16-20.6C32,3.8,28.2,0,23.6,0z"/>
      </svg>
    `;

    heart.onclick = (e) => {
      e.stopPropagation();
      heart.classList.remove("pulse");
      void heart.offsetWidth;
      heart.classList.add("pulse");
      createFloatingHearts(heart);
    };

    /* Divider */
    const divider = document.createElement("div");
    divider.className = "divider";

    /* SOUND BUTTON */
    const soundBtn = document.createElement("div");
    soundBtn.className = "circleBtn";
    soundBtn.innerHTML = globalMuted ? "🔇" : "🔊";

    soundBtn.onclick = (e) => {
      e.stopPropagation();

      globalMuted = !globalMuted;

      videoElements.forEach(v => {
        v.muted = globalMuted;
      });

      soundBtn.innerHTML = globalMuted ? "🔇" : "🔊";
    };

    /* Replay */
    const replayBtn = document.createElement("div");
    replayBtn.className = "circleBtn";
    replayBtn.innerHTML = "↺";
    replayBtn.onclick = (e) => {
      e.stopPropagation();
      video.currentTime = 0;
      video.play();
    };

    actionBar.appendChild(heart);
    actionBar.appendChild(divider);
    actionBar.appendChild(soundBtn);
    actionBar.appendChild(replayBtn);

    slide.appendChild(video);
    slide.appendChild(overlay);
    slide.appendChild(actionBar);

    viewerContainer.appendChild(slide);
  });

  videoElements = document.querySelectorAll("video");

  setupObserver();

  viewer.scrollTo({
    top: startIndex * window.innerHeight,
    behavior: "auto"
  });

  setTimeout(() => {
    activateVideo(startIndex);
  }, 300);
}

/* ================= AUTOPLAY + SOUND ================= */

function setupObserver() {

  if (observer) observer.disconnect();

  observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      const video = entry.target;
      const index = Array.from(videoElements).indexOf(video);

      if (entry.isIntersecting) {
        activateVideo(index);
      }

    });

  }, { threshold: 0.75 });

  videoElements.forEach(video => observer.observe(video));
}

function activateVideo(index) {

  currentIndex = index;

  videoElements.forEach((v, i) => {
    if (i === index) {
      v.muted = globalMuted;
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  });
}

/* ================= CLOSE ================= */

function closeViewer() {

  if (observer) observer.disconnect();

  videoElements.forEach(video => {
    video.pause();
    video.currentTime = 0;
  });

  viewer.classList.add("hidden");
  grid.style.display = "block";
}

/* ================= FLOATING HEARTS ================= */

function createFloatingHearts(parent) {
  for (let i = 0; i < 6; i++) {
    const miniHeart = document.createElement("div");
    miniHeart.className = "floating-heart";
    miniHeart.innerHTML = "❤️";

    miniHeart.style.left = (Math.random() * 40 - 20) + "px";
    miniHeart.style.top = (Math.random() * 20 - 10) + "px";

    parent.appendChild(miniHeart);

    setTimeout(() => {
      miniHeart.remove();
    }, 1000);
  }
}