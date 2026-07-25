const videoTitleInput =
  document.getElementById("videoTitle");

const videoYomiInput =
  document.getElementById("videoYomi");

const youtubeUrlInput =
  document.getElementById("youtubeUrl");

const addButton =
  document.getElementById("addButton");

const sortButton =
  document.getElementById("sortButton");

const videoListElement =
  document.getElementById("videoList");

const youtubePlayer =
  document.getElementById("youtubePlayer");

const emptyMessage =
  document.getElementById("emptyMessage");

const playingTitle =
  document.getElementById("playingTitle");

const errorMessage =
  document.getElementById("errorMessage");

let videos = loadVideos();
let sortable = null;

const icons = {
  play: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M8 5.5v13l10-6.5-10-6.5z"
        fill="currentColor"
      />
    </svg>
  `,

  edit: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M4 16.5V20h3.5L18.1 9.4l-3.5-3.5L4 16.5z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />

      <path
        d="M13.9 6.6l3.5 3.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      />

      <path
        d="M16 4.5l1.1-1.1a1.5 1.5 0 0 1 2.1 0l1.4 1.4a1.5 1.5 0 0 1 0 2.1L19.5 8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>
  `,

  delete: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M5 7h14"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />

      <path
        d="M9 7V4.8h6V7"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />

      <path
        d="M7.5 7l.8 13h7.4l.8-13"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />

      <path
        d="M10 10.5v6M14 10.5v6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>
  `,

  drag: `
    <svg
      viewBox="0 0 12 20"
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="1.2" />
      <circle cx="9" cy="3" r="1.2" />

      <circle cx="3" cy="10" r="1.2" />
      <circle cx="9" cy="10" r="1.2" />

      <circle cx="3" cy="17" r="1.2" />
      <circle cx="9" cy="17" r="1.2" />
    </svg>
  `
};

function loadVideos() {
  const savedVideos =
    localStorage.getItem("youtubeVideos");

  if (!savedVideos) {
    return [];
  }

  try {
    const parsedVideos =
      JSON.parse(savedVideos);

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

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

function getYouTubeVideoId(urlText) {
  try {
    const url = new URL(urlText.trim());

    if (url.hostname === "youtu.be") {
      return url.pathname
        .slice(1)
        .split("/")[0];
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
  const title =
    videoTitleInput.value.trim();

  const yomi =
    videoYomiInput.value.trim();

  const url =
    youtubeUrlInput.value.trim();

  const videoId =
    getYouTubeVideoId(url);

  clearError();

  if (!title) {
    showError(
      "登録名を入力してください。"
    );

    videoTitleInput.focus();
    return;
  }

  if (!videoId) {
    showError(
      "正しいYouTubeのURLを入力してください。"
    );

    youtubeUrlInput.focus();
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

  youtubePlayer.dataset.currentVideoId =
    video.id;

  youtubePlayer.style.display =
    "block";

  emptyMessage.style.display =
    "none";

  playingTitle.textContent =
    video.title;

  renderVideoList();
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

  const trimmedTitle =
    newTitle.trim();

  if (!trimmedTitle) {
    alert(
      "登録名は空欄にできません。"
    );

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

  if (currentVideoId === videoId) {
    playingTitle.textContent =
      trimmedTitle;
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

function normalizeSortText(text) {
  return String(text || "")
    .trim()
    .normalize("NFKC");
}

function sortVideosByYomi() {
  const collator =
    new Intl.Collator("ja-JP", {
      usage: "sort",
      sensitivity: "base",
      numeric: true
    });

  videos = [...videos].sort(
    (a, b) => {
      const aText =
        normalizeSortText(
          a.yomi || a.title
        );

      const bText =
        normalizeSortText(
          b.yomi || b.title
        );

      const result =
        collator.compare(
          aText,
          bText
        );

      if (result !== 0) {
        return result;
      }

      return collator.compare(
        normalizeSortText(a.title),
        normalizeSortText(b.title)
      );
    }
  );

  saveVideos();
  renderVideoList();

  sortButton.textContent =
    "並べ替えました";

  sortButton.classList.add(
    "sortCompleted"
  );

  window.setTimeout(() => {
    sortButton.textContent =
      "五十音順";

    sortButton.classList.remove(
      "sortCompleted"
    );
  }, 1000);
}

function createIconButton({
  icon,
  className,
  label,
  onClick
}) {
  const button =
    document.createElement("button");

  button.type = "button";

  button.className =
    `iconButton ${className}`;

  button.innerHTML = icon;
  button.title = label;

  button.setAttribute(
    "aria-label",
    label
  );

  button.addEventListener(
    "click",
    onClick
  );

  return button;
}

function createDragHandle(videoTitle) {
  const dragHandle =
    document.createElement("button");

  dragHandle.type = "button";
  dragHandle.className = "dragHandle";
  dragHandle.innerHTML = icons.drag;

  dragHandle.title =
    `${videoTitle}を並べ替え`;

  dragHandle.setAttribute(
    "aria-label",
    `${videoTitle}をドラッグして並べ替え`
  );

  return dragHandle;
}

function initializeSortable() {
  if (
    typeof Sortable === "undefined" ||
    sortable
  ) {
    return;
  }

  sortable = new Sortable(
    videoListElement,
    {
      animation: 180,
      handle: ".dragHandle",

      draggable: ".videoItem",

      ghostClass: "dragGhost",
      chosenClass: "dragChosen",
      dragClass: "dragging",

      forceFallback: false,

      onEnd(event) {
        const oldIndex =
          event.oldIndex;

        const newIndex =
          event.newIndex;

        if (
          oldIndex === undefined ||
          newIndex === undefined ||
          oldIndex === newIndex
        ) {
          return;
        }

        const movedVideo =
          videos.splice(
            oldIndex,
            1
          )[0];

        if (!movedVideo) {
          renderVideoList();
          return;
        }

        videos.splice(
          newIndex,
          0,
          movedVideo
        );

        saveVideos();
        renderVideoList();
      }
    }
  );
}

function renderVideoList() {
  videoListElement.innerHTML = "";

  if (videos.length === 0) {
    const emptyList =
      document.createElement("p");

    emptyList.className =
      "emptyList";

    emptyList.textContent =
      "登録されている動画はありません";

    videoListElement.appendChild(
      emptyList
    );

    return;
  }

  videos.forEach((video) => {
    const item =
      document.createElement("div");

    item.className =
      "videoItem";

    item.dataset.videoId =
      video.id;

    if (
      youtubePlayer.dataset.currentVideoId ===
      video.id
    ) {
      item.classList.add(
        "isPlaying"
      );
    }

    const dragHandle =
      createDragHandle(
        video.title
      );

    const videoName =
      document.createElement("span");

    videoName.className =
      "videoName";

    videoName.textContent =
      video.title;

    if (video.yomi) {
      videoName.title =
        `よみがな：${video.yomi}`;
    } else {
      videoName.title =
        "よみがな未登録：登録名を基準に並び替えます";
    }

    const buttonGroup =
      document.createElement("div");

    buttonGroup.className =
      "videoActions";

    const playButton =
      createIconButton({
        icon: icons.play,
        className: "playButton",
        label: `${video.title}を再生`,
        onClick: () => {
          playVideo(video);
        }
      });

    const editButton =
      createIconButton({
        icon: icons.edit,
        className: "editButton",
        label: `${video.title}を編集`,
        onClick: () => {
          editVideo(video.id);
        }
      });

    const deleteButton =
      createIconButton({
        icon: icons.delete,
        className: "deleteButton",
        label: `${video.title}を削除`,
        onClick: () => {
          deleteVideo(video.id);
        }
      });

    buttonGroup.appendChild(
      playButton
    );

    buttonGroup.appendChild(
      editButton
    );

    buttonGroup.appendChild(
      deleteButton
    );

    item.appendChild(
      dragHandle
    );

    item.appendChild(
      videoName
    );

    item.appendChild(
      buttonGroup
    );

    videoListElement.appendChild(
      item
    );
  });
}

addButton.addEventListener(
  "click",
  addVideo
);

sortButton.addEventListener(
  "click",
  sortVideosByYomi
);

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

videoTitleInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      videoYomiInput.focus();
    }
  }
);

renderVideoList();
initializeSortable();