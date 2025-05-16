document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("itinerary-form");
    const tableBody = document.querySelector("#itinerary-table tbody");
    const filterLocation = document.getElementById("filter-location");
    const filterDate = document.getElementById("filter-date");
    const clearFiltersBtn = document.getElementById("clear-filters");
    const sortBtn = document.getElementById("sort-date");
  
    let savedItinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
    let isSortedAsc = true;
    let editingIndex = null; // Track which row is being edited
  
    renderTable(savedItinerary);
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const location = form.elements["location"].value.trim();
      const date = form.elements["date"].value;
      const time = form.elements["time"].value;
      const activity = form.elements["activity"].value.trim();
      const notes = form.elements["notes"].value.trim();
  
      if (!location || !date) {
        alert("Please fill out location and date.");
        return;
      }
  
      // Fetch weather only if adding a new entry or location/date changed during edit
      let weather = "N/A";
      if (editingIndex === null || location !== savedItinerary[editingIndex].location || date !== savedItinerary[editingIndex].date) {
        weather = await fetchWeather(location, date);
      } else {
        weather = savedItinerary[editingIndex].weather;
      }
  
      const entry = { date, time, location, activity, notes, weather };
  
      if (editingIndex !== null) {
        // Update existing entry
        savedItinerary[editingIndex] = entry;
        editingIndex = null;
        form.querySelector("button[type=submit]").textContent = "Add Stop";
      } else {
        // Add new entry
        savedItinerary.push(entry);
      }
  
      localStorage.setItem("itinerary", JSON.stringify(savedItinerary));
      renderTable(savedItinerary);
      form.reset();
    });
  
    function renderTable(data) {
      tableBody.innerHTML = "";
      data.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.date}</td>
          <td>${item.time || "-"}</td>
          <td>${item.location}</td>
          <td>${item.activity || "-"}</td>
          <td>${item.notes || "-"}</td>
          <td>${item.weather || "N/A"}</td>
          <td>
            <button class="edit-btn" data-index="${index}">Edit</button>
            <button class="delete-btn" data-index="${index}">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
  
      // Add event listeners for new buttons
      tableBody.querySelectorAll(".edit-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const idx = e.target.dataset.index;
          startEdit(idx);
        })
      );
  
      tableBody.querySelectorAll(".delete-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
          const idx = e.target.dataset.index;
          deleteEntry(idx);
        })
      );
    }
  
    function startEdit(index) {
      editingIndex = index;
      const item = savedItinerary[index];
  
      form.elements["location"].value = item.location;
      form.elements["date"].value = item.date;
      form.elements["time"].value = item.time;
      form.elements["activity"].value = item.activity;
      form.elements["notes"].value = item.notes;
  
      form.querySelector("button[type=submit]").textContent = "Update Stop";
      // Scroll form into view in case table is long
      form.scrollIntoView({ behavior: "smooth" });
    }
  
    function deleteEntry(index) {
      if (confirm("Are you sure you want to delete this entry?")) {
        savedItinerary.splice(index, 1);
        localStorage.setItem("itinerary", JSON.stringify(savedItinerary));
        renderTable(savedItinerary);
        // If currently editing this entry, reset form
        if (editingIndex === index) {
          editingIndex = null;
          form.reset();
          form.querySelector("button[type=submit]").textContent = "Add Stop";
        }
      }
    }
  
    async function fetchWeather(location, date) {
      try {
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            location
          )}`
        );
        const geoData = await geo.json();
        if (!geoData.length) return "Location not found";
  
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
  
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&timezone=auto`
        );
        const weatherData = await weatherRes.json();
        const forecastDates = weatherData.daily.time;
        const index = forecastDates.indexOf(date);
  
        if (index === -1) return "Forecast unavailable";
  
        const high = weatherData.daily.temperature_2m_max[index];
        const low = weatherData.daily.temperature_2m_min[index];
        const rain = weatherData.daily.precipitation_sum[index];
  
        return `High: ${high}°F, Low: ${low}°F, Rain: ${rain}mm`;
      } catch (err) {
        console.error("Weather fetch error:", err);
        return "Error fetching weather";
      }
    }
  
    // Filtering
    filterLocation.addEventListener("input", applyFilters);
    filterDate.addEventListener("change", applyFilters);
    clearFiltersBtn.addEventListener("click", () => {
      filterLocation.value = "";
      filterDate.value = "";
      renderTable(savedItinerary);
    });
  
    function applyFilters() {
      const loc = filterLocation.value.toLowerCase();
      const date = filterDate.value;
  
      const filtered = savedItinerary.filter((item) => {
        const matchesLocation = loc === "" || item.location.toLowerCase().includes(loc);
        const matchesDate = date === "" || item.date === date;
        return matchesLocation && matchesDate;
      });
  
      renderTable(filtered);

    }
      
    // Sort by date toggle
    sortBtn.addEventListener("click", () => {
      savedItinerary.sort((a, b) => {
        if (isSortedAsc) return a.date.localeCompare(b.date);
        else return b.date.localeCompare(a.date);
      });
      isSortedAsc = !isSortedAsc;
      renderTable(savedItinerary);
    });
  });
  
  
  
  