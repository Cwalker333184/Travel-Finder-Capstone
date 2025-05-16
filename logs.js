// logs.js

// To use jsPDF
const { jsPDF } = window.jspdf;

let entries = [];
let editingEntryId = null; // track if editing

const logForm = document.getElementById("logForm");
const entriesContainer = document.getElementById("entriesContainer");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const exportTxtBtn = document.getElementById("exportTxtBtn");

function saveEntriesToStorage() {
  localStorage.setItem("travelLogs", JSON.stringify(entries));
}

function loadEntriesFromStorage() {
  const data = localStorage.getItem("travelLogs");
  if (data) {
    entries = JSON.parse(data);
  }
}

function resetForm() {
  logForm.reset();
  editingEntryId = null;
  logForm.querySelector("button[type=submit]").textContent = "Add Entry";
}

function renderEntries() {
  entriesContainer.innerHTML = "";

  if (entries.length === 0) {
    entriesContainer.innerHTML = `<p class="text-muted">No travel logs yet. Add your first entry!</p>`;
    return;
  }

  entries.forEach((entry, index) => {
    // Create card element for each entry
    const col = document.createElement("div");
    col.className = "col";

    const card = document.createElement("div");
    card.className = "card h-100 shadow-sm position-relative";

    // Checkbox to select entry for export
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input position-absolute";
    checkbox.style.top = "10px";
    checkbox.style.right = "10px";
    checkbox.dataset.index = index;

    // Card body
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Date, Title, Mood, Entry text
    const dateEl = document.createElement("h6");
    dateEl.textContent = `📅 ${entry.date}`;

    const titleEl = document.createElement("h5");
    titleEl.textContent = entry.title;

    const moodEl = document.createElement("p");
    moodEl.textContent = entry.mood ? `Mood: ${entry.mood}` : "";
    moodEl.style.fontStyle = "italic";

    const textEl = document.createElement("p");
    textEl.textContent = entry.entry;

    cardBody.appendChild(dateEl);
    cardBody.appendChild(titleEl);
    if (entry.mood) cardBody.appendChild(moodEl);
    cardBody.appendChild(textEl);

    // Show photo if any
    if (entry.photoDataUrl) {
      const img = document.createElement("img");
      img.src = entry.photoDataUrl;
      img.alt = "Travel Photo";
      img.className = "img-fluid rounded mt-2";
      cardBody.appendChild(img);
    }

    // Buttons container
    const btnGroup = document.createElement("div");
    btnGroup.className = "d-flex justify-content-end gap-2 mt-3";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-warning";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => startEditEntry(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteEntry(index);

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);

    cardBody.appendChild(btnGroup);

    card.appendChild(checkbox);
    card.appendChild(cardBody);
    col.appendChild(card);
    entriesContainer.appendChild(col);
  });
}

function startEditEntry(index) {
  const entry = entries[index];
  editingEntryId = index;

  document.getElementById("logDate").value = entry.date;
  document.getElementById("logTitle").value = entry.title;
  document.getElementById("logMood").value = entry.mood || "";
  document.getElementById("logEntry").value = entry.entry;

  // Photo can't be set programmatically for security reasons, so inform user
  alert(
    "To change photo, upload a new one. Otherwise, leave the photo field empty to keep the current photo."
  );

  logForm.querySelector("button[type=submit]").textContent = "Save Changes";
}

function deleteEntry(index) {
  if (confirm("Are you sure you want to delete this entry?")) {
    entries.splice(index, 1);
    saveEntriesToStorage();
    renderEntries();
  }
}

function readPhotoFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read photo."));
    reader.readAsDataURL(file);
  });
}

// Handle form submission: add or save edited entry
logForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Bootstrap validation styles
  if (!logForm.checkValidity()) {
    e.stopPropagation();
    logForm.classList.add("was-validated");
    return;
  }
  logForm.classList.remove("was-validated");

  // Gather form data
  const date = document.getElementById("logDate").value;
  const title = document.getElementById("logTitle").value.trim();
  const mood = document.getElementById("logMood").value.trim();
  const entryText = document.getElementById("logEntry").value.trim();

  // Photo
  const photoFile = document.getElementById("logPhoto").files[0];
  let photoDataUrl = null;

  try {
    photoDataUrl = await readPhotoFile(photoFile);
  } catch (err) {
    alert("Error reading photo file.");
    return;
  }

  if (editingEntryId !== null) {
    // Edit existing
    entries[editingEntryId].date = date;
    entries[editingEntryId].title = title;
    entries[editingEntryId].mood = mood;
    entries[editingEntryId].entry = entryText;
    // Replace photo only if a new one was uploaded, else keep old photo
    if (photoDataUrl) {
      entries[editingEntryId].photoDataUrl = photoDataUrl;
    }
    editingEntryId = null;
    logForm.querySelector("button[type=submit]").textContent = "Add Entry";
  } else {
    // New entry
    entries.push({ date, title, mood, entry: entryText, photoDataUrl });
  }

  saveEntriesToStorage();
  renderEntries();
  resetForm();
});

// Export selected entries to text file
exportTxtBtn.addEventListener("click", () => {
  const selectedEntries = getSelectedEntries();
  if (selectedEntries.length === 0) {
    alert("Please select at least one entry to export.");
    return;
  }

  let textContent = "";
  selectedEntries.forEach((e, i) => {
    textContent += `Entry #${i + 1}\nDate: ${e.date}\nTitle: ${e.title}\nMood: ${e.mood || "N/A"}\nEntry:\n${e.entry}\n\n`;
  });

  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "travel-logs.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// Export selected entries to PDF
exportPdfBtn.addEventListener("click", () => {
  const selectedEntries = getSelectedEntries();
  if (selectedEntries.length === 0) {
    alert("Please select at least one entry to export.");
    return;
  }

  const pdf = new jsPDF();

  selectedEntries.forEach((entry, i) => {
    const yStart = 20;
    let y = yStart;

    pdf.setFontSize(14);
    pdf.text(`Entry #${i + 1}`, 10, y);
    y += 10;

    pdf.setFontSize(12);
    pdf.text(`Date: ${entry.date}`, 10, y);
    y += 7;

    pdf.text(`Title: ${entry.title}`, 10, y);
    y += 7;

    if (entry.mood) {
      pdf.text(`Mood: ${entry.mood}`, 10, y);
      y += 7;
    }

    // Split long text so it wraps in PDF
    const lines = pdf.splitTextToSize(entry.entry, 180);
    pdf.text("Entry:", 10, y);
    y += 7;
    pdf.text(lines, 10, y);
    y += lines.length * 7;

    // Add photo if exists (small size)
    if (entry.photoDataUrl) {
      // Add photo at bottom right corner of page or new page if needed
      const pageHeight = pdf.internal.pageSize.height;
      if (y + 50 > pageHeight) {
        pdf.addPage();
        y = 20;
      }
      pdf.addImage(entry.photoDataUrl, "JPEG", 140, y, 50, 50);
      y += 55;
    } else {
      y += 10;
    }

    // Add page break if not last
    if (i < selectedEntries.length - 1) {
      pdf.addPage();
    }
  });

  pdf.save("travel-logs.pdf");
});

function getSelectedEntries() {
  const checkboxes = entriesContainer.querySelectorAll("input[type=checkbox]");
  const selected = [];
  checkboxes.forEach((cb) => {
    if (cb.checked) {
      const idx = parseInt(cb.dataset.index, 10);
      selected.push(entries[idx]);
    }
  });
  return selected;
}

// Initial load
loadEntriesFromStorage();
renderEntries();
