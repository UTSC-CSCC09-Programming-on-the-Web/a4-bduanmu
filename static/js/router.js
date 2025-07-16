/**
 * The following code was generated using the
 * following Github Copilot prompt and manually editted:
 *
 * Make the application a SPA with javascript loading all pages.
 *
 * Add a signup and login page.
 *
 * create a homepage which shows each user's gallery
 */

/* SPA Router - Handles client-side navigation without page reloads */

let router = (function () {
  "use strict";

  let module = {};
  let currentView = "gallery";
  // Define all available views/pages
  const views = {
    home: {
      title: "Home - The Web Gallery",
      render: renderHomeView,
    },
    gallery: {
      title: "The Web Gallery",
      render: renderGalleryView,
    },
    credits: {
      title: "Credits - The Web Gallery",
      render: renderCreditsView,
    },
    login: {
      title: "Login - The Web Gallery",
      render: renderLoginView,
    },
    signup: {
      title: "Sign Up - The Web Gallery",
      render: renderSignupView,
    },
  };

  // Render the home view showing all users
  function renderHomeView() {
    return `
      <div class="page">
        <div class="home-container">
          <div class="home-header">
            <h1 class="title">The Web Gallery</h1>
            <span id="authNav" class="nav-links">
              <a href="#" onclick="event.preventDefault(); router.navigate('credits')" class="text-regular link">Credits</a>
            </span>
          </div>
          <div class="users-grid" id="usersGrid">
            <p class="loading-text">Loading users...</p>
          </div>
          <div class="row home-gallery-buttons">
            <div class="col-5 button-container">
              <div id="homeGalleryLeftButton" class="button button-left"></div>
            </div>
            <p id="homePageNumber" class="col-2 text-regular home-page-number">Loading page...</p>
            <div class="col-5 button-container">
              <div id="homeGalleryRightButton" class="button button-right"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render the main gallery view
  function renderGalleryView() {
    return `
      <div class="row page">
        <div class="form-section popup" id="popup">
          <h2 class="form-header">Post an image</h2>
          <form class="form" id="postImageForm">
            <textarea
              rows="12"
              class="input form-input"
              placeholder="Enter the title"
              name="content"
              maxlength="250"
              required
            ></textarea>
            <input
              id="postImageFile"
              type="file"
              class="input form-input"
              accept="image/*"
              name="image"
              required
            />
            <button type="submit" class="button button-submit"></button>
          </form>
          <div class="preview">
            <p class="text-regular preview-text">Image Preview:</p>
            <div class="preview-image-container">
              <img
                id="previewImage"
                class="image"
                src="media/placeholder.png"
                alt="Preview Image"
              />
            </div>
          </div>
        </div>

        <div class="col-7 col-sm-12 image-section">
          <div class="row header">
            <div class="col-2 post-button-container">
              <div class="button-post text-bold" id="postButton">Post</div>
            </div>
            <h1 class="col-8 title" id="galleryTitle">The Web Gallery</h1>
            <div class="col-2"></div>
          </div>
          <div class="row image-header">
            <p id="imageNumber" class="col-10 text-regular image-number">0/0</p>
            <div class="col-2 image-header">
              <div id="imageDeleteButton" class="button button-delete"></div>
            </div>
          </div>
          <div class="row carousel">
            <div class="col-2 button-container">
              <div id="imageLeftButton" class="button button-left"></div>
            </div>
            <div class="col-8 image-container">
              <img
                id="image"
                class="image"
                src="media/loading.gif"
                alt="Placeholder"
              />
            </div>
            <div class="col-2 button-container">
              <div id="imageRightButton" class="button button-right"></div>
            </div>
          </div>          <div class="image-info-container">
            <p id="imageTitle" class="text-bold image-info-text">Loading...</p>
            <p id="imageAuthor" class="text-regular image-info-text"></p>
          </div>
          <p><a href="#" onclick="router.navigate('home')" class="link text-regular">← Back to Home</a></p>
        </div>

        <div class="col-5 col-sm-12 comments-section comments-section-sm">
          <h2 class="comments-header">Comments</h2>
          <div class="comment-container">
            <p class="preview-text no-comments-message">Loading comments...</p>
          </div>
          <div class="row comment-buttons">
            <div class="col-6 button-container">
              <div id="commentLeftButton" class="button button-left"></div>
            </div>
            <div class="col-6 button-container">
              <div id="commentRightButton" class="button button-right"></div>
            </div>
          </div>
          <form class="form" id="postCommentForm">
            <p class="text-bold">Post your comment</p>
            <textarea
              rows="4"
              class="input"
              placeholder="Enter your comment"
              name="content"
              maxlength="250"
              required
            ></textarea>
            <button type="submit" class="button button-submit"></button>
          </form>
        </div>
      </div>
    `;
  }

  // Render the credits view
  function renderCreditsView() {
    return `
      <div class="page">
        <div class="credits-container">
          <a href="#" onclick="router.navigate('home')" class="link text-regular">← Back to Home</a>
          <h1 class="title">Credits</h1>
          <div class="credits-links">
            <p><a class="link" href="https://www.flaticon.com/free-icons/left-arrow" title="left arrow icons" target="_blank">
              Left arrow icons created by Arkinasi - Flaticon</a></p>
            <p><a class="link" href="https://www.flaticon.com/free-icons/next" title="next icons" target="_blank">
              Next icons created by Arkinasi - Flaticon</a></p>
            <p><a class="link" href="https://www.flaticon.com/free-icons/delete" title="delete icons" target="_blank">
              Delete icons created by Ilham Fitrotul Hayat - Flaticon</a></p>
            <p><a class="link" href="https://www.flaticon.com/free-icons/send" title="send icons" target="_blank">
              Send icons created by Amazona Adorada - Flaticon</a></p>
            <p><a class="link" href="https://www.flaticon.com/free-icons/picture" title="picture icons" target="_blank">
              Picture icons created by Freepik - Flaticon</a></p>
            <p><a class="link" href="https://www.icegif.com/loading-4/" target="_blank">Loading GIF from ICEGIF</a></p>
          </div>
        </div>
      </div>
    `;
  }

  // Render the login view
  function renderLoginView() {
    return `
      <div class="page">
        <div class="auth-container">
          <div class="auth-card">
            <h1 class="auth-title">Login</h1>
            <form class="auth-form" id="loginForm">
              <div class="form-group">
                <label class="text-bold" for="loginUsername">Username</label>
                <input
                  type="text"
                  id="loginUsername"
                  name="username"
                  class="input form-input"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div class="form-group">
                <label class="text-bold" for="loginPassword">Password</label>
                <input
                  type="password"
                  id="loginPassword"
                  name="password"
                  class="input form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" class="button auth-button">Login</button>
              <div id="loginError" class="error-message"></div>
            </form>
            <div class="auth-links">
              <p>Don't have an account? <a href="#" onclick="event.preventDefault(); router.navigate('signup')" class="link text-regular">Sign up</a></p>
              <p><a href="#" onclick="router.navigate('home')" class="link text-regular">← Back to Home</a></p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render the signup view
  function renderSignupView() {
    return `
      <div class="page">
        <div class="auth-container">
          <div class="auth-card">
            <h1 class="auth-title">Sign Up</h1>
            <form class="auth-form" id="signupForm">
              <div class="form-group">
                <label class="text-bold" for="signupUsername">Username</label>
                <input
                  type="text"
                  id="signupUsername"
                  name="username"
                  class="input form-input"
                  placeholder="Choose a username"
                  required
                  minlength="3"
                  maxlength="32"
                />
              </div>
              <div class="form-group">
                <label class="text-bold" for="signupPassword">Password</label>
                <input
                  type="password"
                  id="signupPassword"
                  name="password"
                  class="input form-input"
                  placeholder="Choose a password"
                  required
                  minlength="6"
                />
              </div>
              <div class="form-group">
                <label class="text-bold" for="signupPasswordConfirm">Confirm Password</label>
                <input
                  type="password"
                  id="signupPasswordConfirm"
                  name="passwordConfirm"
                  class="input form-input"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <button type="submit" class="button auth-button">Sign Up</button>
              <div id="signupError" class="error-message"></div>
            </form>
            <div class="auth-links">
              <p>Already have an account? <a href="#" onclick="event.preventDefault(); router.navigate('login')" class="link text-regular">Login</a></p>
              <p><a href="#" onclick="router.navigate('home')" class="link text-regular">← Back to Home</a></p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Navigate to a specific view without page reload
  module.navigate = function (viewName) {
    if (!views[viewName]) {
      console.error("View not found:", viewName);
      return;
    }

    currentView = viewName;

    // Update the URL without reloading the page
    const newUrl = viewName === "home" ? "/" : `/${viewName}`;
    history.pushState({ view: viewName }, "", newUrl);

    // Update the page title
    document.title = views[viewName].title;

    // Render the new view
    renderCurrentView();
  };

  // Initialize the router
  module.init = function () {
    // Determine initial view based on current URL
    const path = window.location.pathname;
    if (path === "/gallery") {
      currentView = "gallery";
    } else if (path === "/credits") {
      currentView = "credits";
    } else if (path === "/login") {
      currentView = "login";
    } else if (path === "/signup") {
      currentView = "signup";
    } else {
      currentView = "home"; // Default to home
    }

    // Set initial page title
    document.title = views[currentView].title;

    // Set initial history state
    history.replaceState({ view: currentView }, "", window.location.pathname);

    // Render initial view
    renderCurrentView();
  };

  // Render the current view
  function renderCurrentView() {
    const appContainer = document.getElementById("app");
    if (!appContainer) {
      console.error("App container not found");
      return;
    }

    // Clear current content and render new view
    appContainer.innerHTML = views[currentView].render();

    // Re-initialize event listeners for the current view
    if (currentView === "home") {
      setTimeout(() => {
        if (window.initializeHomeEvents) {
          window.initializeHomeEvents();
        }
        if (window.setupHomePageNavigation) {
          window.setupHomePageNavigation();
        }
      }, 0);
    } else if (currentView === "gallery") {
      // Delay to ensure DOM is ready
      setTimeout(() => {
        if (window.initializeGalleryEvents) {
          window.initializeGalleryEvents();
        }
      }, 0);
    } else if (currentView === "login") {
      setTimeout(() => {
        if (window.initializeLoginEvents) {
          window.initializeLoginEvents();
        }
      }, 0);
    } else if (currentView === "signup") {
      setTimeout(() => {
        if (window.initializeSignupEvents) {
          window.initializeSignupEvents();
        }
      }, 0);
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener("popstate", function (event) {
    if (event.state && event.state.view) {
      currentView = event.state.view;
    } else {
      // Default to home view if no state
      currentView = "home";
    }
    document.title = views[currentView].title;
    renderCurrentView();
  });
  return module;
})();
