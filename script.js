const videoTitleInput = document.getElementById("videoTitle");
const videoYomiInput = document.getElementById("videoYomi");
const youtubeUrlInput = document.getElementById("youtubeUrl");

const addButton = document.getElementById("addButton");
const sortButton = document.getElementById("sortButton");
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
    const parsedVideos = JSON.parse(savedVideos);

    if (!Array.isArray(parsedVideos)) {
      return [];
    }

    return parsedVideos.map((video) => ({
      ...video,
      yomi:
        typeof video.yomi === "string"
          ? video.yomi
          : ""
    }));
  } catch (error) {
    console.error(
      "保存データの読み込みに失敗しました。",
      error
    );

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
  const yomi = videoYomiInput.value.trim();
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
    yomi,
    youtubeId: videoId
  };

  videos.push(newVideo);

  saveVideos();
  renderVideoList();

  videoTitleInput.value = "";
  videoYomiInput.value = "";
  youtubeUrlInput.value = "";

  videoTitleInput.focus();
}

function playVideo(video) {
  youtubePlayer.src =
    `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;

  youtubePlayer.dataset.currentVideoId = video.id;
  youtubePlayer.style.display = "block";

  emptyMessage.style.display = "none";

  if (playingTitle) {
    playingTitle.textContent = video.title;
  }
}

function editVideo(videoId) {
  const video = videos.find(
    (item) => item.id === videoId
  );

  if (!video) {
    return;
  }

  const newTitle = prompt(
    "新しい登録名を入力してください。",
    video.title
  );

  if (newTitle === null) {
    return;
  }

  const trimmedTitle = newTitle.trim();

  if (!trimmedTitle) {
    alert("登録名は空欄にできません。");
    return;
  }

  const newYomi = prompt(
    "新しいよみがなを入力してください。",
    video.yomi || ""
  );

  if (newYomi === null) {
    return;
  }

  video.title = trimmedTitle;
  video.yomi = newYomi.trim();

  saveVideos();
  renderVideoList();

  const currentVideoId =
    youtubePlayer.dataset.currentVideoId;

  if (
    currentVideoId === videoId &&
    playingTitle
  ) {
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

    if (playingTitle) {
      playingTitle.textContent =
        "再生中の動画はありません";
    }
  }

  saveVideos();
  renderVideoList();
}

function normalizeSortText(text) {
  return String(text || "")
    .trim()
    .normalize("NFKC");
}

function sortVideosByYomi() {
  videos.sort((a, b) => {
    const aSortText = normalizeSortText(
      a.yomi || a.title
    );

    const bSortText = normalizeSortText(
      b.yomi || b.title
    );

    const yomiResult = aSortText.localeCompare(
      bSortText,
      "ja",
      {
        sensitivity: "base",
        numeric: true
      }
    );

    if (yomiResult !== 0) {
      return yomiResult;
    }

    return normalizeSortText(
      a.title
    ).localeCompare(
      normalizeSortText(b.title),
      "ja",
      {
        sensitivity: "base",
        numeric: true
      }
    );
  });

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

    if (video.yomi) {
      videoName.title = `よみがな：${video.yomi}`;
    } else {
      videoName.title =
        "よみがな未登録：登録名を基準に並び替えます";
    }

    const playButton = document.createElement("button");
    playButton.textContent = "再生";

    playButton.addEventListener("click", () => {
      playVideo(video);
    });

    const editButton = document.createElement("button");
    editButton.textContent = "編集";

    editButton.addEventListener("click", () => {
      editVideo(video.id);
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
sortButton.addEventListener("click", sortVideosByYomi);

youtubeUrlInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      addVideo();
    }
  }
);

videoYomiInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      youtubeUrlInput.focus();
    }
  }
);

renderVideoList();