let galleryImages = [];
let currentIndex = 0;

// Save image to localStorage and update gallery
function saveImageToGallery(base64Image, caption = "", location = "") {
  const stored = JSON.parse(localStorage.getItem("galleryImages")) || [];
  const newImage = {
    src: base64Image,
    caption,
    location,
    timestamp: new Date().toISOString()
  };
  stored.push(newImage);
  localStorage.setItem("galleryImages", JSON.stringify(stored));
  loadGallery();
}

// Load gallery images and show current
function loadGallery() {
  galleryImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
  if (galleryImages.length === 0) {
    document.getElementById("gallery-image").style.display = "none";
    document.getElementById("gallery-caption").innerText = "No images yet.";
    return;
  }

  document.getElementById("gallery-image").style.display = "block";
  currentIndex = Math.min(currentIndex, galleryImages.length - 1);
  showImage(currentIndex);
}

// Show a specific image in the slideshow
function showImage(index) {
  const imageData = galleryImages[index];
  const imageEl = document.getElementById("gallery-image");
  const captionEl = document.getElementById("gallery-caption");

  if (imageData) {
    imageEl.src = imageData.src;
    captionEl.innerHTML = `<strong>${imageData.caption}</strong><br><small>${imageData.location || ""}</small>`;
  }
}

// Handle manual upload
function handleManualUpload(event) {
  event.preventDefault();

  const file = document.getElementById("manual-image-upload").files[0];
  const caption = document.getElementById("manual-caption").value.trim();
  const location = document.getElementById("manual-location").value.trim();

  if (!file) return alert("Select an image first.");

  const reader = new FileReader();
  reader.onload = () => {
    saveImageToGallery(reader.result, caption, location);

    document.getElementById("manual-image-upload").value = "";
    document.getElementById("manual-caption").value = "";
    document.getElementById("manual-location").value = "";
  };
  reader.readAsDataURL(file);
}

// Delete current image
function deleteCurrentImage() {
  if (galleryImages.length === 0) return;

  galleryImages.splice(currentIndex, 1);
  localStorage.setItem("galleryImages", JSON.stringify(galleryImages));

  if (currentIndex >= galleryImages.length) {
    currentIndex = galleryImages.length - 1;
  }

  loadGallery();
}

// Navigation
document.addEventListener("DOMContentLoaded", () => {
  loadGallery();

  document.getElementById("manual-upload-form").addEventListener("submit", handleManualUpload);
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (galleryImages.length > 0) {
      currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
      showImage(currentIndex);
    }
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    if (galleryImages.length > 0) {
      currentIndex = (currentIndex + 1) % galleryImages.length;
      showImage(currentIndex);
    }
  });

  document.getElementById("delete-btn").addEventListener("click", deleteCurrentImage);
});
