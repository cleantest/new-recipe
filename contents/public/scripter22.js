const baseUrl = "http://localhost:8080/M00922271";

// Render Header
function renderHeader() {
  const header = document.createElement("header");
  header.innerHTML = `
    <div class="logo">Recipe Hub</div>
    <nav>
      <button id="home-link">Home</button>
      <a href="#about" id="about-link">About</a>
      <a href="#contact" id="contact-link">Contact</a>
      <a href="#share" id="share-link" style="display: none;">Share Recipe</a>
    </nav>
    <div id="auth-buttons">
      <button id="profile-btn" style="display: none;">Profile</button>
      <button id="login-btn">Login</button>
      <button id="register-btn">Register</button>
      <button id="logout-btn" style="display: none;">Logout</button>
    </div>
  `;
  document.body.prepend(header);
}

// Render Footer
function renderFooter() {
  const footer = document.createElement("footer");
  footer.innerHTML = `
    <p>&copy; 2024 Recipe Hub. Sharing recipes made simple. | <a href="#privacy">Privacy Policy</a></p>
  `;
  document.body.appendChild(footer);
}

// Render Main Content
function renderMainContent() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <main>
      <section id="search-section" style="display: none;">
        <h2>Search</h2>
        <div>
          <select id="search-filter">
            <option value="recipes">Recipes</option>
            <option value="users">Users</option>
          </select>
          <input type="text" id="search-query" placeholder="Enter search term..." />
          <button id="search-btn">Search</button>
        </div>
        <div id="search-results"></div>
      </section>
      <section id="auth-section" style="display: flex;">
        <div id="login-form" style="display: block;">
          <h2>Login</h2>
          <form id="login-form-el">
            <input type="text" id="login-username" placeholder="Username" required />
            <input type="password" id="login-password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
        </div>
        <div id="register-form" style="display: none;">
          <h2>Register</h2>
          <form id="register-form-el">
            <input type="text" id="register-username" placeholder="Username" required />
            <input type="password" id="register-password" placeholder="Password" required />
            <input type="email" id="register-email" placeholder="Email" required />
            <button type="submit">Register</button>
          </form>
        </div>
      </section>
      <section id="recipe-upload-section" style="display: none;">
        <h2>Upload Your Recipe</h2>
        <form id="recipe-upload-form">
          <input type="text" id="recipe-name" placeholder="Recipe Name" required />
          <textarea id="recipe-description" placeholder="Recipe Description" required></textarea>
          <textarea id="recipe-ingredients" placeholder="Ingredients (comma-separated)" required></textarea>
          <button type="submit">Upload Recipe</button>
        </form>
      </section>
      <section id="content-section" style="display: none;">
        <h2>Welcome, <span id="user-display"></span>!</h2>
        <div id="recipes-list"></div>
      </section>
    </main>
  `;
}

// Toggle Section Visibility
function toggleSectionVisibility(sectionId) {
  const allSections = document.querySelectorAll("section");
  allSections.forEach((section) => {
    section.style.display = "none";
  });
  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.style.display = "block";
}

// Toggle Buttons Based on Login Status
function toggleButtons(isLoggedIn) {
  const loginButton = document.getElementById("login-btn");
  const registerButton = document.getElementById("register-btn");
  const logoutButton = document.getElementById("logout-btn");
  const shareLink = document.getElementById("share-link");
  const profileButton = document.getElementById("profile-btn");

  loginButton.style.display = isLoggedIn ? "none" : "block";
  registerButton.style.display = isLoggedIn ? "none" : "block";
  logoutButton.style.display = isLoggedIn ? "block" : "none";
  shareLink.style.display = isLoggedIn ? "inline-block" : "none";
  profileButton.style.display = isLoggedIn ? "block" : "none";
}

// Handle Registration
function handleRegister(event) {
  event.preventDefault();
  const data = {
    username: document.getElementById("register-username").value,
    password: document.getElementById("register-password").value,
    email: document.getElementById("register-email").value,
  };

  fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Registration failed");
      return response.json();
    })
    .then(() => {
      alert("Registration successful! Proceed to login.");
      document.getElementById("register-form-el").reset();
      toggleSectionVisibility("auth-section");
      document.getElementById("login-form").style.display = "block";
      document.getElementById("register-form").style.display = "none";
    })
    .catch((err) => alert(err.message));
}

// Handle Login

function handleLogin(event) {
  event.preventDefault();
  const data = {
    username: document.getElementById("login-username").value,
    password: document.getElementById("login-password").value,
  };

  fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Invalid login credentials");
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      toggleButtons(true);
      toggleSectionVisibility("content-section");
      document.getElementById("user-display").textContent = data.username;
      fetchUserContent();
    })
    .catch((err) => alert(err.message));
}

// Handle Logout
function handleLogout() {
  localStorage.removeItem("token");
  alert("Logged out successfully!");
  toggleButtons(false);
  toggleSectionVisibility("auth-section");
}

// Fetch User Content
function fetchUserContent() {
  fetch(`${baseUrl}/contents`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((response) => response.json())
    .then((data) => {
      const recipesList = data
        .map(
          (recipe) => `
        <div>
          <h3>${recipe.name}</h3>
          <p>${recipe.description}</p>
        </div>
      `
        )
        .join("");
      document.getElementById("recipes-list").innerHTML = recipesList;
    })
    .catch((err) => alert(err.message));
}

// Handle Recipe Upload
function handleRecipeUpload(event) {
  event.preventDefault();
  const recipeData = {
    name: document.getElementById("recipe-name").value,
    description: document.getElementById("recipe-description").value,
    ingredients: document
      .getElementById("recipe-ingredients")
      .value.split(",")
      .map((i) => i.trim()),
  };

  fetch(`${baseUrl}/contents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(recipeData),
  })
    .then((response) => response.json())
    .then(() => {
      alert("Recipe uploaded successfully!");
      toggleSectionVisibility("content-section");
      fetchUserContent();
    })
    .catch((err) => alert(err.message));
}

// Handle Search
function handleSearch() {
  const query = document.getElementById("search-query").value.trim();
  const filter = document.getElementById("search-filter").value;

  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  const endpoint =
    filter === "users"
      ? `${baseUrl}/users/search?q=${query}`
      : `${baseUrl}/contents/search?q=${query}`;

  fetch(endpoint, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to search ${filter}`);
      return response.json();
    })
    .then((results) => {
      const resultsContainer = document.getElementById("search-results");
      resultsContainer.innerHTML = results
        .map(
          (result) => `
        <div>
          <h3>${result.name || result.username}</h3>
          <p>${result.description || result.bio || "No details available"}</p>
        </div>
      `
        )
        .join("");
      toggleSectionVisibility("search-section");
    })
    .catch((err) => alert(err.message));
}

// Add Event Listeners
function addEventListeners() {
  // Event listener for Register button
  document.getElementById("register-btn").addEventListener("click", () => {
    toggleSectionVisibility("auth-section"); // Ensure the auth section is visible
    document.getElementById("login-form").style.display = "none"; // Hide the login form
    document.getElementById("register-form").style.display = "block"; // Show the register form
  });

  // Event listener for Login button
  document.getElementById("login-btn").addEventListener("click", () => {
    toggleSectionVisibility("auth-section"); // Ensure the auth section is visible
    document.getElementById("register-form").style.display = "none"; // Hide the register form
    document.getElementById("login-form").style.display = "block"; // Show the login form
  });

  // Existing event listeners
  document.getElementById("register-form-el").addEventListener("submit", handleRegister);
  document.getElementById("login-form-el").addEventListener("submit", handleLogin);
  document.getElementById("logout-btn").addEventListener("click", handleLogout);
  document.getElementById("recipe-upload-form").addEventListener("submit", handleRecipeUpload);
  document.getElementById("search-btn").addEventListener("click", handleSearch);

  document.getElementById("home-link").addEventListener("click", () => {
    toggleSectionVisibility("search-section");
  });
  document.getElementById("share-link").addEventListener("click", () => {
    toggleSectionVisibility("recipe-upload-section");
  });
  document.getElementById("profile-btn").addEventListener("click", () => {
    toggleSectionVisibility("content-section");
  });
}


// Initialize App
function initializeApp() {
  renderHeader();
  renderFooter();
  renderMainContent();
  addEventListeners();

  const token = localStorage.getItem("token");
  if (token) {
    toggleButtons(true);
    fetchUserContent();
    toggleSectionVisibility("content-section");
  } else {
    toggleButtons(false);
    toggleSectionVisibility("auth-section");
  }
}

initializeApp();
