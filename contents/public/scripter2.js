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
      <a href="#recipes" id="recipes-link" style="display: none;">Recipes</a>
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
  footer.id = "app-footer"; // Assign an ID to easily manipulate the footer
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
     <section id="recipes-section" style="display: none;">
        <h2>All Recipes</h2>
        <div id="recipes-container"></div>
      </section>
       <!-- <section id="user-profile-section" style="display: none;">
  <div class="profile-header">
    <!-- Username -->
    <h2 id="profile-username" class="profile-username"></h2>
  </div>
  <div class="profile-content">
   
    <h3 class="profile-subheading">Uploaded Recipes</h3>
    <div id="user-recipes-container" class="recipes-container">
      <!-- Recipe cards will be dynamically injected here -->
    </div>
  </div>
</section> -->
     <section id="user-profile-section" style="display: none;">
  <div class="profile-header">
    <h2 id="profile-username" class="profile-username"></h2>
    <div class="profile-stats">
      <p id="followers-count">Followers: 0</p>
      <p id="following-count">Following: 0</p>
    </div>
  </div>
  <div class="profile-content">
    <h3 class="profile-subheading">Uploaded Recipes</h3>
    <div id="user-recipes-container" class="recipes-container">
      <!-- Recipe cards will be dynamically injected here -->
    </div>
  </div>
</section>


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
        <div id="suggestions-container"></div> <!-- Add this element -->

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
  const recipesLink = document.getElementById("recipes-link");

  loginButton.style.display = isLoggedIn ? "none" : "block";
  registerButton.style.display = isLoggedIn ? "none" : "block";
  logoutButton.style.display = isLoggedIn ? "block" : "none";
  shareLink.style.display = isLoggedIn ? "inline-block" : "none";
  profileButton.style.display = isLoggedIn ? "block" : "none";
  recipesLink.style.display = isLoggedIn ? "inline-block" : "none";
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
      document.getElementById("app-footer").style.display = "none"; // Hide footer
    })
    .catch((err) => alert(err.message));
}


// Handle Logout
function handleLogout() {
  localStorage.removeItem("token");
  alert("Logged out successfully!");
  toggleButtons(false);
  toggleSectionVisibility("auth-section");
  document.getElementById("app-footer").style.display = "block"; // Show footer
}

function fetchAndDisplayRecipes() {
  const recipesContainer = document.getElementById("recipes-container");

  if (!recipesContainer) {
    console.warn("Element with ID 'recipes-container' not found.");
    return;
  }

  recipesContainer.innerHTML = "<p>Loading recipes...</p>";

  fetch(`${baseUrl}/contents`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch recipes");
      return response.json();
    })
    .then((recipes) => {
      if (!recipes || recipes.length === 0) {
        recipesContainer.innerHTML = "<p>No recipes found.</p>";
        return;
      }

      // Dynamically render recipes
      recipesContainer.innerHTML = recipes
        .map(
          (recipe) => `
            <div class="recipe-card">
              <h3>${recipe.name}</h3>
              <p>${recipe.description}</p>
              <p><strong>Uploaded by:</strong> ${recipe.uploadedBy}</p>
              <p><small>Uploaded on: ${new Date(recipe.createdAt).toLocaleString()}</small></p>
            </div>
          `
        )
        .join("");

      toggleSectionVisibility("recipes-section"); // Show the recipes section
    })
    .catch((err) => {
      console.error("Error fetching recipes:", err.message);
      recipesContainer.innerHTML = "<p>Error loading recipes. Please try again later.</p>";
    });
}


function fetchUserProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must log in to view your profile.");
    return;
  }

  const profileUsernameElement = document.getElementById("profile-username");
  const followersCountElement = document.getElementById("followers-count");
  const followingCountElement = document.getElementById("following-count");
  const userRecipesContainer = document.getElementById("user-recipes-container");

  // Fetch profile stats
  fetch(`${baseUrl}/profile/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch profile stats");
      return response.json();
    })
    .then((stats) => {
      followersCountElement.textContent = `Followers: ${stats.followersCount}`;
      followingCountElement.textContent = `Following: ${stats.followingCount}`;
    })
    .catch((err) => console.error("Error fetching profile stats:", err.message));

  // Fetch uploaded recipes
  fetch(`${baseUrl}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch uploads");
      return response.json();
    })
    .then((uploads) => {
      userRecipesContainer.innerHTML = uploads
        .map(
          (upload) => `
          <div class="recipe-card">
            <h3>${upload.name}</h3>
            <p>${upload.description}</p>
            <p><strong>Uploaded:</strong> ${new Date(upload.createdAt).toLocaleString()}</p>
          </div>
        `
        )
        .join("");
    })
    .catch((err) => console.error("Error fetching uploads:", err.message));
}

/*function fetchUserProfile(userId) {
  fetch(`${baseUrl}/users/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch user profile");
      return response.json();
    })
    .then((data) => {
      const profileUsername = document.getElementById("profile-username");
      const followBtn = document.getElementById("follow-btn");
      const userRecipesContainer = document.getElementById("user-recipes-container");

      profileUsername.textContent = data.username;
      followBtn.textContent = data.isFollowing ? "Unfollow" : "Follow";
      followBtn.onclick = () => handleFollowUnfollow(userId, !data.isFollowing);

      userRecipesContainer.innerHTML = data.recipes
        .map(
          (recipe) => `
          <div class="recipe-card">
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
          </div>
        `
        )
        .join("");

      toggleSectionVisibility("user-profile-section");
    })
    .catch((err) => alert(err.message));
}*/

function fetchUploaderProfile(userId) {
  console.log("Fetching profile for userId:", userId); // Debugging

  if (!userId || userId === "undefined") {
    alert("Invalid user ID. Please try again.");
    return;
  }

  fetch(`${baseUrl}/users/${userId}/recipes`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch uploader profile");
      return response.json();
    })
    .then((data) => {
      const profileUsername = document.getElementById("profile-username");
      const userRecipesContainer = document.getElementById("user-recipes-container");

      // Populate user profile
      profileUsername.textContent = data.user.username;

      // Populate recipes uploaded by the user
      userRecipesContainer.innerHTML = data.recipes
        .map(
          (recipe) => `
          <div class="recipe-card">
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
          </div>
        `
        )
        .join("");

      toggleSectionVisibility("user-profile-section");
    })
    .catch((err) => alert(err.message));
}


function handleFollowUnfollow(userId, follow) {
  fetch(`${baseUrl}/follow`, {
      method: follow ? "POST" : "DELETE",
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ userId }),
  })
      .then((response) => {
          if (!response.ok) throw new Error("Failed to update follow status");
          return response.json();
      })
      .then(() => {
          alert(follow ? "Followed successfully!" : "Unfollowed successfully!");
          handleSearch(); // Refresh search results
      })
      .catch((err) => alert(err.message));
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
function fetchFollowing() {
  fetch(`${baseUrl}/following`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch following list");
      return response.json();
    })
    .then((data) => {
      const followingContainer = document.getElementById("search-results");
      followingContainer.innerHTML = `<h3>Following (${data.count})</h3>`;
      if (data.count === 0) {
        followingContainer.innerHTML += "<p>You are not following anyone.</p>";
        return;
      }

      followingContainer.innerHTML += data.following
        .map(
          (user) => `
          <div class="user-card">
            <h4>${user.username}</h4>
          </div>
        `
        )
        .join("");

      toggleSectionVisibility("search-section");
    })
    .catch((err) => alert(err.message));
}


function handleSearch() {
  const query = document.getElementById("search-query").value.trim();
  const filter = document.getElementById("search-filter").value;
  const resultsContainer = document.getElementById("search-results");

  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  resultsContainer.innerHTML = "<p>Loading results...</p>";

  const endpoint =
    filter === "users"
      ? `${baseUrl}/users/search?q=${encodeURIComponent(query)}`
      : `${baseUrl}/contents/search?q=${encodeURIComponent(query)}`;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must log in to perform a search.");
    return;
  }

  fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data || data.length === 0) {
        resultsContainer.innerHTML = "<p>No results found.</p>";
        return;
      }

      resultsContainer.innerHTML = "";

      if (filter === "users") {
        data.forEach((user) => {
          const userCard = document.createElement("div");
          userCard.className = "user-card";
          userCard.innerHTML = `
            <h4>${user.uploadedBy}</h4>
            <button onclick="handleFollowUnfollow('${user.userId}', ${!user.isFollowing})">
              ${user.isFollowing ? "Unfollow" : "Follow"}
            </button>
            <div class="uploads">
              ${user.uploads
                .map(
                  (upload) => `
                <div class="recipe-card">
                  <h3>${upload.name}</h3>
                  <p>${upload.description}</p>
                </div>
              `
                )
                .join("")}
            </div>
          `;
          resultsContainer.appendChild(userCard);
        });
      }
    })
    .catch((err) => {
      console.error("Error fetching search results:", err.message);
      resultsContainer.innerHTML = `<p>Error fetching search results: ${err.message}</p>`;
    });
}



// Add event listener for the search button


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

  // Event listener for search input (for suggestions)

  // Other event listeners
  document.getElementById("register-form-el").addEventListener("submit", handleRegister);
  document.getElementById("login-form-el").addEventListener("submit", handleLogin);
  document.getElementById("logout-btn").addEventListener("click", handleLogout);
  document.getElementById("recipe-upload-form").addEventListener("submit", handleRecipeUpload);
  document.getElementById("profile-btn").addEventListener("click", fetchUserProfile);

  //document.getElementById("profile-btn").addEventListener("click", fetchFollowing);
  document.getElementById("recipes-link").addEventListener("click", () => {
    fetchAndDisplayRecipes();document.getElementById("recipes-link").addEventListener("click", fetchAndDisplayRecipes);


    document.getElementById("search-btn").addEventListener("click", handleSearch);

  });

  document.getElementById("home-link").addEventListener("click", () => {
    toggleSectionVisibility("search-section");
  });
  document.getElementById("share-link").addEventListener("click", () => {
    toggleSectionVisibility("recipe-upload-section");
  });
  /*document.getElementById("profile-btn").addEventListener("click", () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must log in to view your profile.");
      return;
    }
  
    // Fetch and display the user's uploads
    fetch(`${baseUrl}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch uploads");
        return response.json();
      })
      .then((uploads) => {
        const recipesContainer = document.getElementById("recipes-container");
        if (!uploads || uploads.length === 0) {
          recipesContainer.innerHTML = "<p>No uploads found.</p>";
        } else {
          recipesContainer.innerHTML = uploads
            .map(
              (upload) => `
              <div class="recipe-card">
                <h3>${upload.name}</h3>
                <p>${upload.description}</p>
                <p><strong>Uploaded:</strong> ${new Date(upload.createdAt).toLocaleString()}</p>
              </div>
            `
            )
            .join("");
        }
  
        // Show the recipes section for uploads
        toggleSectionVisibility("recipes-section");
      })
      .catch((err) => {
        console.error("Error fetching uploads:", err.message);
        alert("Error loading your uploads. Please try again.");
      });
  });*/
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
    document.getElementById("app-footer").style.display = "none"; // Hide footer
  } else {
    toggleButtons(false);
    toggleSectionVisibility("auth-section");
    document.getElementById("app-footer").style.display = "block"; // Show footer
  }
}

initializeApp();
