// Save uploaded image to gallery (stored in localStorage)
function saveImageToGallery(base64Image, caption = "", location = "", type = "visited") {
    const galleryImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
    const newImage = {
      id: Date.now(),
      src: base64Image,
      caption,
      location,
      type,
      latlng: location,
      timestamp: new Date().toISOString()
    };
    galleryImages.push(newImage);
    localStorage.setItem("galleryImages", JSON.stringify(galleryImages));
    renderGalleryPins();
  }
  
  function deleteImageFromGallery(id) {
    let galleryImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
    galleryImages = galleryImages.filter(img => img.id !== id);
    localStorage.setItem("galleryImages", JSON.stringify(galleryImages));
    renderGalleryPins();
  }
  
  function renderGalleryPins() {
    const galleryImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
    markersLayer.clearLayers();
    galleryImages.forEach(image => {
      const [lat, lng] = image.location.split(',').map(parseFloat);
      const marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: image.type === "want" ? "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png" : "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
          iconSize: [32, 32]
        })
      });
  
      const popupContent = `
        <img src="${image.src}" style="max-width:100%; border-radius:4px;" /><br>
        <strong>${image.caption}</strong><br>
        <button onclick="deleteImageFromGallery(${image.id})">Delete</button>
      `;
      marker.bindPopup(popupContent);
      markersLayer.addLayer(marker);
    });
  }
  
  // Initialize map
  const map = L.map('map').setView([37.7749, -122.4194], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  
  const markersLayer = L.layerGroup().addTo(map);
  renderGalleryPins();
  
  // On map click, show image upload form
  map.on('click', function (e) {
    showUploadPopup(e.latlng);
  });
  
  function showUploadPopup(latlng, defaultCaption = '', defaultImage = null) {
    const popupContent = document.createElement('div');
    popupContent.innerHTML = `
      <form id="popup-form">
        <input type="text" id="map-caption" placeholder="Enter caption" value="${defaultCaption}" /><br><br>
        <input type="file" id="map-image-upload" accept="image/*" /><br><br>
        <select id="pin-type">
          <option value="visited">Visited</option>
          <option value="want">Want to Visit</option>
        </select><br><br>
        <button type="submit">Save</button>
      </form>
    `;
  
    const popup = L.popup()
      .setLatLng(latlng)
      .setContent(popupContent)
      .openOn(map);
  
    setTimeout(() => {
      const form = popupContent.querySelector('#popup-form');
      form?.addEventListener('submit', function (event) {
        event.preventDefault();
  
        const caption = popupContent.querySelector('#map-caption').value.trim();
        const fileInput = popupContent.querySelector('#map-image-upload');
        const type = popupContent.querySelector('#pin-type').value;
        const file = fileInput.files[0];
  
        if (!file) {
          alert("Please select an image.");
          return;
        }
  
        const reader = new FileReader();
        reader.onload = function () {
          const base64Image = reader.result;
  
          saveImageToGallery(base64Image, caption, `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`, type);
          map.closePopup();
        };
        reader.readAsDataURL(file);
      });
    }, 100);
  }
  
  // Search functionality
  let searchMarker = null;
  document.getElementById('search-btn').addEventListener('click', function () {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
  
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          map.setView([lat, lon], 13);
          showUploadPopup({ lat, lng: lon }, query);
        } else {
          alert("Location not found.");
        }
      })
      .catch(() => alert("Error searching for location."));
  });
  