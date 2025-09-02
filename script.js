
// Global variables
let currentUser = null;
let extinguishers = [];

// DOM elements
const loginPage = document.getElementById("loginPage");
const homepage = document.getElementById("homepage");
const addExtinguisherPage = document.getElementById("addExtinguisherPage");
const recordsPage = document.getElementById("recordsPage");
const inspectionPage = document.getElementById("inspectionPage");

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  showPage("login");
  setupEventListeners();
});

// Event listeners setup
function setupEventListeners() {
  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  
  // Navigation buttons
  document.getElementById("addExtinguishersCard").addEventListener("click", () => showPage("addExtinguisher"));
  document.getElementById("dataRecordsCard").addEventListener("click", () => showPage("records"));
  document.getElementById("inspectionCard").addEventListener("click", () => showPage("inspection"));
  
  // Back buttons
  document.getElementById("backToHomeFromAdd").addEventListener("click", () => showPage("home"));
  document.getElementById("backToHomeFromRecords").addEventListener("click", () => showPage("home"));
  document.getElementById("backToHomeFromInspection").addEventListener("click", () => showPage("home"));
  
  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
  
  // Form submission
  document.getElementById("extinguisherForm").addEventListener("submit", handleAddExtinguisher);
  
  // Type selection change
  document.getElementById("type").addEventListener("change", handleTypeChange);
  
  // Search and filter
  document.getElementById("searchInput").addEventListener("input", filterRecords);
  document.getElementById("conditionFilter").addEventListener("change", filterRecords);
}

// Login handler
function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  // Simple authentication (in real app, this would be server-side)
  if (username === "inspector" && password === "password123") {
    currentUser = {
      username: username,
      name: "Fire Inspector"
    };
    
    document.getElementById("loggedUser").textContent = currentUser.name;
    document.getElementById("responsible").value = currentUser.name;
    
    showPage("home");
    updateStats();
  } else {
    alert("Invalid username or password. Please try again.");
  }
}

// Logout handler
function handleLogout() {
  currentUser = null;
  showPage("login");
  document.getElementById("loginForm").reset();
}

// Page navigation
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });
  
  // Show selected page
  switch(pageName) {
    case "login":
      loginPage.classList.remove("hidden");
      break;
    case "home":
      homepage.classList.remove("hidden");
      break;
    case "addExtinguisher":
      addExtinguisherPage.classList.remove("hidden");
      if (currentUser) {
        document.getElementById("responsible").value = currentUser.name;
      }
      break;
    case "records":
      recordsPage.classList.remove("hidden");
      displayRecords();
      break;
    case "inspection":
      inspectionPage.classList.remove("hidden");
      displayInspections();
      break;
  }
}

// Handle type change for weight label
function handleTypeChange() {
  const type = document.getElementById("type").value;
  const weightLabel = document.getElementById("weightLabel");
  
  if (type === "CO2") {
    weightLabel.textContent = "Current Weight (kg):";
  } else {
    weightLabel.textContent = "Current Weight (kg):";
  }
}

// Add extinguisher handler
function handleAddExtinguisher(e) {
  e.preventDefault();

  const id = document.getElementById("extId").value;
  const location = document.getElementById("location").value;
  const type = document.getElementById("type").value;
  const brand = document.getElementById("brand").value;
  const capacity = document.getElementById("capacity").value;
  const weight = document.getElementById("weight").value;
  const pressure = document.getElementById("pressure").value;
  const lastRefill = document.getElementById("lastRefill").value;
  const lastTest = document.getElementById("lastTest").value;
  const condition = document.getElementById("condition").value;
  const responsible = document.getElementById("responsible").value;
  const notes = document.getElementById("notes").value;

  // Check if ID already exists
  if (extinguishers.some(ext => ext.id === id)) {
    alert("Serial number already exists!");
    return;
  }

  // Calculate next refill and next test (1 year later)
  function addYear(dateStr) {
    const date = new Date(dateStr);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split("T")[0];
  }

  const nextRefill = addYear(lastRefill);
  const nextTest = addYear(lastTest);

  // Create extinguisher object
  const extinguisher = {
    id,
    location,
    type,
    brand,
    capacity,
    weight,
    pressure,
    lastRefill,
    nextRefill,
    lastTest,
    nextTest,
    condition,
    responsible,
    notes,
    dateAdded: new Date().toISOString().split("T")[0]
  };

  // Add to array
  extinguishers.push(extinguisher);
  
  // Save to localStorage
  localStorage.setItem("extinguishers", JSON.stringify(extinguishers));

  // Reset form and show success
  document.getElementById("extinguisherForm").reset();
  alert("Fire extinguisher added successfully!");
  
  // Auto-fill responsible person for next entry
  if (currentUser) {
    document.getElementById("responsible").value = currentUser.name;
  }
  
  updateStats();
}

// Display records
function displayRecords() {
  const listBody = document.getElementById("listBody");
  listBody.innerHTML = "";

  extinguishers.forEach(ext => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ext.id}</td>
      <td>${ext.location}</td>
      <td>${ext.type}</td>
      <td>${ext.brand || "N/A"}</td>
      <td>${ext.capacity ? ext.capacity + " kg" : "N/A"}</td>
      <td>${ext.weight ? ext.weight + " kg" : "N/A"}</td>
      <td>${ext.pressure || "N/A"}</td>
      <td>${ext.lastRefill}</td>
      <td>${ext.nextRefill}</td>
      <td>${ext.lastTest}</td>
      <td>${ext.nextTest}</td>
      <td><span class="condition-badge ${ext.condition.toLowerCase().replace(' ', '-')}">${ext.condition}</span></td>
      <td>${ext.responsible}</td>
      <td>${ext.notes || "N/A"}</td>
      <td>
        <button class="delete-btn" onclick="deleteExtinguisher('${ext.id}')">Delete</button>
      </td>
    `;
    listBody.appendChild(row);
  });
}

// Filter records
function filterRecords() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const conditionFilter = document.getElementById("conditionFilter").value;
  
  const rows = document.querySelectorAll("#listBody tr");
  
  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const id = cells[0].textContent.toLowerCase();
    const location = cells[1].textContent.toLowerCase();
    const type = cells[2].textContent.toLowerCase();
    const condition = cells[11].textContent;
    
    const matchesSearch = id.includes(searchTerm) || location.includes(searchTerm) || type.includes(searchTerm);
    const matchesCondition = !conditionFilter || condition === conditionFilter;
    
    if (matchesSearch && matchesCondition) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Delete extinguisher
function deleteExtinguisher(id) {
  if (confirm(`Are you sure you want to delete extinguisher ${id}?`)) {
    extinguishers = extinguishers.filter(ext => ext.id !== id);
    localStorage.setItem("extinguishers", JSON.stringify(extinguishers));
    displayRecords();
    updateStats();
    alert("Extinguisher deleted successfully!");
  }
}

// Display inspections
function displayInspections() {
  const inspectionList = document.getElementById("inspectionList");
  inspectionList.innerHTML = "";

  if (extinguishers.length === 0) {
    inspectionList.innerHTML = "<p>No extinguishers registered for inspection.</p>";
    return;
  }

  // Calculate inspection priorities
  const getInspectionPriority = (ext) => {
    const nextRefillDate = new Date(ext.nextRefill);
    const today = new Date();
    const daysUntilRefill = Math.ceil((nextRefillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRefill < 0) return { level: "overdue", label: "OVERDUE", class: "overdue" };
    if (daysUntilRefill <= 30) return { level: "urgent", label: "Due Soon", class: "urgent" };
    return { level: "normal", label: "Up to Date", class: "normal" };
  };

  const sortedExtinguishers = extinguishers
    .map(ext => ({ ...ext, priority: getInspectionPriority(ext) }))
    .sort((a, b) => {
      const priorityOrder = { "overdue": 0, "urgent": 1, "normal": 2 };
      return priorityOrder[a.priority.level] - priorityOrder[b.priority.level];
    });

  sortedExtinguishers.forEach(ext => {
    const inspectionItem = document.createElement("div");
    inspectionItem.className = `inspection-item ${ext.priority.class}`;
    inspectionItem.innerHTML = `
      <div class="inspection-info">
        <h4>${ext.id} - ${ext.location}</h4>
        <p>${ext.type} Extinguisher • Next Refill: ${ext.nextRefill}</p>
        <span class="priority-badge ${ext.priority.class}">${ext.priority.label}</span>
      </div>
      <div class="inspection-actions">
        <button class="inspect-btn ${ext.priority.class}" onclick="startInspection('${ext.id}')">
          ${ext.priority.level === 'overdue' ? 'Urgent Inspection' : 'Start Inspection'}
        </button>
      </div>
    `;
    inspectionList.appendChild(inspectionItem);
  });
}

// Start inspection
function startInspection(id) {
  const ext = extinguishers.find(e => e.id === id);
  if (ext) {
    alert(`Starting inspection for ${ext.id} at ${ext.location}`);
    // Here you could add actual inspection functionality
  }
}

// Update statistics
function updateStats() {
  const total = extinguishers.length;
  const good = extinguishers.filter(ext => ext.condition === "Good").length;
  const service = extinguishers.filter(ext => ext.condition === "Needs Service").length;
  const expired = extinguishers.filter(ext => ext.condition === "Expired").length;
  
  document.getElementById("totalStat").textContent = total;
  document.getElementById("goodStat").textContent = good;
  document.getElementById("serviceStat").textContent = service;
  document.getElementById("expiredStat").textContent = expired;
}

// Load data from localStorage on page load
function loadData() {
  const stored = localStorage.getItem("extinguishers");
  if (stored) {
    extinguishers = JSON.parse(stored);
  }
}

// Initialize data loading
loadData();
