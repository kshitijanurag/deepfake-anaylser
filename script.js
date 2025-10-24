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
let uploadedFiles = [];
const errorToastColor = "#ff0000";

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
    showToast({
      message: "❌ Please upload valid images (JPG, JPEG, PNG and WEBP only)",
      color: errorToastColor,
    });
    return;
  }

  uploadedFiles = files;

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

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  progressText.textContent = `Uploading ${files.length} file${files.length > 1 ? "s" : ""}...`;

  fetch("https://kshitijanurag-deepfake-backend.hf.space/predict", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      progressFill.classList.add("complete");
      progressFill.style.width = "100%";
      progressPercent.textContent = "100%";
      progressText.textContent = `✅ Uploaded ${files.length}/${files.length} file${files.length > 1 ? "s" : ""}`;
      showToast({ message: "✅ All files uploaded successfully" });
      showResultsFromAPI(data.results, files);
    })
    .catch((err) => {
      console.error(err);
      showToast({
        message: "❌ Upload failed: " + err.message,
        color: errorToastColor,
      });
    });
}

const analyseAgainBtn = document.getElementById("rerunBtn");
analyseAgainBtn.addEventListener("click", () => {
  if (!uploadedFiles.length) {
    showToast({
      message: "❌ No files to analyse, please select files first.",
      color: errorToastColor,
    });
    return;
  }

  clearResults();
  startUpload(uploadedFiles);
});

function showResultsFromAPI(resultsArray, files) {
  results.classList.remove("hidden");
  resultsList.innerHTML = "";

  resultsArray.forEach((res, idx) => {
    const card = document.createElement("div");
    card.className = "result-card";

    const preview = document.createElement("div");
    preview.className = "result-preview";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(files[idx]);
    preview.appendChild(img);

    const status = document.createElement("div");
    status.className =
      "result-status " +
      (res.label === "Deepfake" ? "status-fake" : "status-real");
    status.textContent = res.label === "Deepfake" ? "❌ Deepfake" : "✅ Real";

    const confidence = Math.round(res.fake_probability * 100);
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
  if (!uploadedFiles.length) {
    showToast({ message: "❌ No files to clear" });
    return;
  }

  fileInput.value = "";
  clearGrid();
  clearResults();
  showToast({ message: "Cleared all files" });
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

function showToast({ message, color = "#6c63ff" }) {
  toast.textContent = message;
  toast.style.background = color;

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
