
// Current user data
let currentUser = null;

// Get DOM elements
const loginSection = document.getElementById("loginSection");
const mainDashboard = document.getElementById("mainDashboard");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeText = document.getElementById("welcomeText");
const extinguisherForm = document.getElementById("extinguisherForm");
const listBody = document.getElementById("listBody");
const typeSelect = document.getElementById("type");
const weightLabel = document.getElementById("weightLabel");
const weightInput = document.getElementById("weight");

// Sample users (in real app, this would be server-side)
const users = [
  { username: "inspector1", password: "password123", name: "John Smith", role: "Fire Inspector" },
  { username: "admin", password: "admin123", name: "Admin User", role: "Administrator" },
  { username: "manager", password: "manager123", name: "Safety Manager", role: "Safety Manager" }
];

// Login form handler
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  // Check credentials
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    currentUser = user;
    welcomeText.textContent = `Welcome, ${user.name}`;
    
    // Auto-fill responsible person field
    const responsibleField = document.getElementById("responsible");
    if (responsibleField) {
      responsibleField.value = user.name;
    }
    
    // Hide login, show dashboard
    loginSection.style.display = "none";
    mainDashboard.style.display = "block";
    showPage('home');
  } else {
    alert("Invalid username or password");
  }
});

// Logout handler
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  loginSection.style.display = "block";
  mainDashboard.style.display = "none";
  loginForm.reset();
  showPage('home');
});

// Page navigation
function showPage(pageName) {
  // Hide all pages
  const pages = ['homePage', 'addExtinguisherPage', 'dataRecordsPage', 'inspectionPage'];
  pages.forEach(page => {
    const element = document.getElementById(page);
    if (element) {
      element.style.display = 'none';
    }
  });
  
  // Show selected page
  const targetPage = document.getElementById(pageName === 'home' ? 'homePage' : pageName + 'Page');
  if (targetPage) {
    targetPage.style.display = 'block';
  }
}

// Handle type selection for weight field
typeSelect.addEventListener("change", (e) => {
  const selectedType = e.target.value;
  
  if (selectedType === "CO2") {
    weightLabel.textContent = "Current Weight (CO₂):";
    weightInput.placeholder = "Current weight in kg";
    weightInput.required = true;
  } else {
    weightLabel.textContent = "Weight:";
    weightInput.placeholder = "Weight in kg";
    weightInput.required = false;
  }
});

// Extinguisher form handler
extinguisherForm.addEventListener("submit", (e) => {
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

  // Calculate next refill and next test (1 year later)
  function addYear(dateStr) {
    const date = new Date(dateStr);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split("T")[0];
  }

  const nextRefill = addYear(lastRefill);
  const nextTest = addYear(lastTest);

  // Create table row
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${id}</td>
    <td>${location}</td>
    <td>${type}</td>
    <td>${brand}</td>
    <td>${capacity}</td>
    <td>${weight || 'N/A'}</td>
    <td>${pressure || 'N/A'}</td>
    <td>${lastRefill}</td>
    <td>${nextRefill}</td>
    <td>${lastTest}</td>
    <td>${nextTest}</td>
    <td><span class="status-${condition.toLowerCase().replace(' ', '-')}">${condition}</span></td>
    <td>${responsible}</td>
    <td>${notes || 'N/A'}</td>
  `;
  listBody.appendChild(row);

  // Reset form and show success
  extinguisherForm.reset();
  
  // Re-fill responsible person field
  if (currentUser) {
    document.getElementById("responsible").value = currentUser.name;
  }
  
  alert("Fire extinguisher added successfully!");
  
  // Optionally redirect to records page
  showPage('dataRecords');
});

// Initialize responsible person field when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Set initial state
  showPage('home');
});
