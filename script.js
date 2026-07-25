const videoTitleInput = document.getElementById("videoTitle");
const youtubeUrlInput = document.getElementById("youtubeUrl");
const addButton = document.getElementById("addButton");
const videoListElement = document.getElementById("videoList");

const youtubePlayer = document.getElementById("youtubePlayer");
const emptyMessage = document.getElementById("emptyMessage");
const playingTitle = document.getElementById("playingTitle");
const errorMessage = document.getElementById("errorMessage");

let videos = loadVideos();

function loadVideos() {
  const savedVideos = localStorage.getItem("youtubeVideos");

  if (!savedVideos) {
    return [];
  }

  try {
    return JSON.parse(savedVideos);
  } catch (error) {
    console.error("保存データの読み込みに失敗しました。", error);
    return [];
  }
}

function saveVideos() {
  localStorage.setItem(
    "youtubeVideos",
    JSON.stringify(videos)
  );
}

function getYouTubeVideoId(urlText) {
  try {
    const url = new URL(urlText.trim());

    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0];
    }

    if (
      url.hostname.includes("youtube.com") &&
      url.pathname === "/watch"
    ) {
      return url.searchParams.get("v");
    }

    if (
      url.hostname.includes("youtube.com") &&
      url.pathname.startsWith("/shorts/")
    ) {
      return url.pathname
        .split("/shorts/")[1]
        .split("/")[0];
    }

    if (
      url.hostname.includes("youtube.com") &&
      url.pathname.startsWith("/embed/")
    ) {
      return url.pathname
        .split("/embed/")[1]
        .split("/")[0];
    }

    return null;
  } catch (error) {
    return null;
  }
}

function addVideo() {
  const title = videoTitleInput.value.trim();
  const url = youtubeUrlInput.value.trim();
  const videoId = getYouTubeVideoId(url);

  errorMessage.textContent = "";

  if (!title) {
    errorMessage.textContent =
      "登録名を入力してください。";
    return;
  }

  if (!videoId) {
    errorMessage.textContent =
      "正しいYouTubeのURLを入力してください。";
    return;
  }

  const newVideo = {
    id: crypto.randomUUID(),
    title,
    youtubeId: videoId
  };

  videos.push(newVideo);

  saveVideos();
  renderVideoList();

  videoTitleInput.value = "";
  youtubeUrlInput.value = "";
}

function playVideo(video) {
  youtubePlayer.src =
    `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;

  youtubePlayer.dataset.currentVideoId = video.id;
  youtubePlayer.style.display = "block";

  emptyMessage.style.display = "none";
  playingTitle.textContent = video.title;
}

function editVideoTitle(videoId) {
  const video = videos.find(
    (item) => item.id === videoId
  );

  if (!video) {
    return;
  }

  const newTitle = prompt(
    "新しいタイトルを入力してください。",
    video.title
  );

  if (newTitle === null) {
    return;
  }

  const trimmedTitle = newTitle.trim();

  if (!trimmedTitle) {
    alert("タイトルは空欄にできません。");
    return;
  }

  video.title = trimmedTitle;

  saveVideos();
  renderVideoList();

  const currentVideoId =
    youtubePlayer.dataset.currentVideoId;

  if (currentVideoId === videoId) {
    playingTitle.textContent = trimmedTitle;
  }
}

function deleteVideo(videoId) {
  const video = videos.find(
    (item) => item.id === videoId
  );

  if (!video) {
    return;
  }

  const shouldDelete = confirm(
    `「${video.title}」を削除しますか？`
  );

  if (!shouldDelete) {
    return;
  }

  videos = videos.filter(
    (item) => item.id !== videoId
  );

  if (
    youtubePlayer.dataset.currentVideoId === videoId
  ) {
    youtubePlayer.src = "";
    youtubePlayer.style.display = "none";
    youtubePlayer.dataset.currentVideoId = "";

    emptyMessage.style.display = "block";
    playingTitle.textContent =
      "再生中の動画はありません";
  }

  saveVideos();
  renderVideoList();
}

function renderVideoList() {
  videoListElement.innerHTML = "";

  if (videos.length === 0) {
    const emptyList = document.createElement("p");

    emptyList.className = "emptyList";
    emptyList.textContent =
      "登録されている動画はありません";

    videoListElement.appendChild(emptyList);
    return;
  }

  videos.forEach((video) => {
    const item = document.createElement("div");
    item.className = "videoItem";

    const videoName = document.createElement("span");
    videoName.className = "videoName";
    videoName.textContent = video.title;

    const playButton = document.createElement("button");
    playButton.textContent = "再生";

    playButton.addEventListener("click", () => {
      playVideo(video);
    });

    const editButton = document.createElement("button");
    editButton.textContent = "名前編集";

    editButton.addEventListener("click", () => {
      editVideoTitle(video.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.className = "deleteButton";

    deleteButton.addEventListener("click", () => {
      deleteVideo(video.id);
    });

    item.appendChild(videoName);
    item.appendChild(playButton);
    item.appendChild(editButton);
    item.appendChild(deleteButton);

    videoListElement.appendChild(item);
  });
}

addButton.addEventListener("click", addVideo);

youtubeUrlInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      addVideo();
    }
  }
);

renderVideoList();