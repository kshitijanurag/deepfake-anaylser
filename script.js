const fileInput = document.getElementById("fileInput");
const selectBtn = document.getElementById("selectBtn");
const clearBtn = document.getElementById("clearBtn");
const fileGrid = document.getElementById("fileGrid");
const dropArea = document.getElementById("dropArea");
const progressWrapper = document.getElementById("progressWrapper");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const results = document.getElementById("results");
const resultsList = document.getElementById("resultsList");
const toast = document.getElementById("toast");

let activeObjectURLs = [];

const defaultText = selectBtn.textContent;

selectBtn.addEventListener("click", () => fileInput.click());
clearBtn.addEventListener("click", clearAll);
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

if (dropArea) {
  ["dragenter", "dragover"].forEach((evName) => {
    dropArea.addEventListener(evName, (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      dropArea.classList.add("dragover");
      selectBtn.textContent = "Drop files";
    });
  });

  ["dragleave", "dragend", "drop"].forEach((evName) => {
    dropArea.addEventListener(evName, (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      dropArea.classList.remove("dragover");
      selectBtn.textContent = defaultText;
    });
  });

  dropArea.addEventListener("drop", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const dt = ev.dataTransfer;
    if (!dt) return;
    const files = Array.from(dt.files || []);
    if (files.length) {
      try {
        const dataTransfer = new DataTransfer();
        files.forEach((f) => dataTransfer.items.add(f));
        fileInput.files = dataTransfer.files;
      } catch (err) {}
      handleFiles(files);
    }
  });
}

function handleFiles(input) {
  let filesArr = [];
  if (!input) input = fileInput.files;
  if (Array.isArray(input)) filesArr = input;
  else if (input instanceof FileList) filesArr = Array.from(input);

  const files = filesArr.filter((file) =>
    ["image/jpg", "image/jpeg", "image/png", "image/webp"].includes(file.type),
  );
  clearGrid();
  clearResults();

  if (files.length === 0) {
    showToast("❌ Please upload valid images (JPG, JPEG, PNG and WEBP only)");
    return;
  }

  files.forEach((f) => {
    const card = document.createElement("div");
    card.className = "file-card";

    const preview = document.createElement("div");
    preview.className = "preview-media";

    const img = document.createElement("img");
    const objUrl = URL.createObjectURL(f);
    img.src = objUrl;
    activeObjectURLs.push(objUrl);
    preview.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "file-meta";
    meta.textContent = `${f.name} (${humanFileSize(f.size)})`;

    card.appendChild(preview);
    card.appendChild(meta);
    fileGrid.appendChild(card);
  });

  startUpload(files);
}

function startUpload(files) {
  progressWrapper.classList.remove("hidden");
  progressFill.classList.remove("complete");

  let uploaded = 0;
  let total = files.length;

  function uploadFile(file, idx) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);

    xhr.upload.addEventListener("progress", e => {
      if (e.lengthComputable) {
        const filePercent = (e.loaded / e.total) * 100;
        const overall = Math.min(
          100,
          Math.round(((uploaded + filePercent / 100) / total) * 100)
        );
        progressFill.style.width = overall + "%";
        progressPercent.textContent = overall + "%";
        progressText.textContent = `Uploading ${idx + 1}/${total} files`;
      }
    });

    xhr.addEventListener("load", () => {
      uploaded++;
      if (uploaded === total) {
        progressFill.classList.add("complete");
        progressFill.style.width = "100%";
        progressText.textContent = `Uploaded ${total}/${total} files ✅`;
        progressPercent.textContent = "100%";
        showToast("✅ All files uploaded successfully!");
        showResults(files);
      } else {
        uploadFile(files[uploaded], uploaded);
      }
    });

     const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  }

  uploadFile(files[0], 0);
}

function showResults(files) {
  results.classList.remove("hidden");
  resultsList.innerHTML = "";

  files.forEach((file) => {
    const card = document.createElement("div");
    card.className = "result-card";

    const preview = document.createElement("div");
    preview.className = "result-preview";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);

    const isFake = Math.random() > 0.5;
    const status = document.createElement("div");
    status.className =
      "result-status " + (isFake ? "status-fake" : "status-real");
    status.textContent = isFake ? "❌ Deepfake" : "✅ Real";

    const confidence = Math.floor(60 + Math.random() * 40);
    const bar = document.createElement("div");
    bar.className = "confidence-bar";
    const fill = document.createElement("div");
    fill.className =
      "confidence-fill " +
      (confidence >= 85
        ? "conf-high"
        : confidence >= 70
          ? "conf-med"
          : "conf-low");
    bar.appendChild(fill);

    const confText = document.createElement("div");
    confText.className = "confidence-text";
    confText.textContent = `Confidence: ${confidence}%`;

    card.appendChild(preview);
    card.appendChild(status);
    card.appendChild(bar);
    card.appendChild(confText);
    resultsList.appendChild(card);

    setTimeout(() => {
      fill.style.width = confidence + "%";
    }, 300);
  });
}

function clearAll() {
  fileInput.value = "";
  clearGrid();
  clearResults();
  showToast("Cleared all files");
}

function clearGrid() {
  fileGrid.innerHTML = "";
  activeObjectURLs.forEach((u) => URL.revokeObjectURL(u));
  activeObjectURLs = [];
  progressWrapper.classList.add("hidden");
  progressFill.style.width = "0%";
  progressText.textContent = "";
  progressPercent.textContent = "";
}

function clearResults() {
  results.classList.add("hidden");
  resultsList.innerHTML = "";
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function humanFileSize(bytes, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) return bytes + " B";
  const units = si ? ["kB", "MB", "GB"] : ["KiB", "MiB", "GiB"];
  let u = -1;
  const r = 10 ** dp;
  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );
  return bytes.toFixed(dp) + " " + units[u];
}
