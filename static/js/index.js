/**
 * The following code was refactored using the
 * following Github Copilot prompt and manually editted:
 *
 * Make the application a SPA with javascript loading all pages.
 *
 * Add a signup and login page.
 *
 * create a homepage which shows each user's gallery
 */

/* global meact, apiService, router */

(function () {
  "use strict";

  const [currentImageIdx, getCurrentImageIdx, setCurrentImageIdx] =
    meact.useState(0);
  const [commentPageNumber, getCommentPageNumber, setCommentPageNumber] =
    meact.useState(0);
  const [imageCount, getImageCount, setImageCount] = meact.useState(0);
  const [currentUser, getCurrentUser, setCurrentUser] = meact.useState(null);
  const [galleryOwner, getGalleryOwner, setGalleryOwner] =
    meact.useState("");
  const [homePageNumber, getHomePageNumber, setHomePageNumber] =
    meact.useState(0);
  const [homePageCount, getHomePageCount, setHomePageCount] = meact.useState(0);

  // Function to initialize gallery events - called by router when gallery view loads
  window.initializeGalleryEvents = function () {
    // Update auth navigation
    setTimeout(updateAuthNav, 0);

    // Update owner buttons and gallery title
    setTimeout(updateOwnerButtons, 0);

    // Set up form and button event listeners (only once)
    setupGalleryEventListeners();

    // Set up gallery navigation buttons (only once)
    setupGalleryNavigation();

    // Load initial gallery data and comments
    loadGalleryData();
    setTimeout(() => {
      loadImageComments(); // Ensure comments load on initial gallery load
    }, 100);
  };

  // Separate function to set up all gallery event listeners (only once)
  function setupGalleryEventListeners() {
    /**
     * The following code was generated using the
     * following Github Copilot prompt and manually editted:
     *
     * When you press the Post button the form should
     * appear in the middle of the screen as a popup
     */
    const postBtn = document.querySelector("#postButton");
    const popup = document.querySelector("#popup");

    // Only show post button if user is the gallery owner
    if (postBtn) {
      const user = getCurrentUser();
      if (user && user.username === getGalleryOwner()) {
        postBtn.classList.remove("hidden");

        if (popup && !postBtn.hasAttribute("data-listener-added")) {
          postBtn.setAttribute("data-listener-added", "true");
          postBtn.addEventListener("click", function () {
            popup.classList.add("visible");
          });
          // Hide popup when clicking outside the form
          popup.addEventListener("click", function (e) {
            if (e.target === popup) {
              popup.classList.remove("visible");
            }
          });
          // Hide popup on Escape key
          document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
              popup.classList.remove("visible");
            }
          });
        }
      } else {
        postBtn.classList.add("hidden");
      }
    }

    /**
     * The following code was generated using the
     * following Github Copilot prompt and manually editted:
     *
     * Make the preview image source be the inputed URL
     *
     * I am no longer using a url to submit images but rather a
     * file upload, update the preview image to reflect this change
     */
    // Update preview image when file input changes
    const fileInput = document.querySelector("#postImageFile");
    const previewImg = document.querySelector("#previewImage");
    if (
      fileInput &&
      previewImg &&
      !fileInput.hasAttribute("data-listener-added")
    ) {
      fileInput.setAttribute("data-listener-added", "true");
      fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            previewImg.src = e.target.result;
          };
          reader.readAsDataURL(file);
        } else {
          previewImg.src = "media/placeholder.png";
        }
      });
    }

    // Handle form submission
    const postForm = document.querySelector("#postImageForm");
    if (postForm && popup && !postForm.hasAttribute("data-listener-added")) {
      postForm.setAttribute("data-listener-added", "true");
      postForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const user = getCurrentUser();

        // Check if user is logged in and is the gallery owner
        if (!user) {
          alert("Please log in to post images");
          router.navigate("login");
          return;
        }

        if (user.username !== getGalleryOwner()) {
          alert("Only the gallery owner can post images");
          return;
        }

        const submitBtn = postForm.querySelector(".button-submit");
        if (submitBtn) {
          submitBtn.classList.add("button-loading", "disabled");
        }

        // Create FormData and add the current user's username
        const formData = new FormData(postForm);
        formData.set("author", user.username);

        // Store form data using apiService
        apiService
          .addImage(formData)
          .then(() => {
            apiService.getImageCount(getGalleryOwner()).then((count) => {
              if (submitBtn) {
                submitBtn.classList.remove("button-loading", "disabled");
              }
              // Reset current image index to the last image
              setImageCount(count);
              setCurrentImageIdx(0);
            });
            // Hide popup and reset form
            popup.classList.remove("visible");
            postForm.reset();
            if (previewImg) previewImg.src = "media/placeholder.png";
          })
          .catch((error) => {
            if (submitBtn) {
              submitBtn.classList.remove("button-loading", "disabled");
            }
            alert("Error posting image: " + error.message);
          });
      });
    }

    const commentForm = document.querySelector("#postCommentForm");
    if (commentForm && !commentForm.hasAttribute("data-listener-added")) {
      commentForm.setAttribute("data-listener-added", "true");
      commentForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Check if user is logged in
        if (!getCurrentUser()) {
          alert("Please log in to post comments");
          router.navigate("login");
          return;
        }

        const submitBtn = commentForm.querySelector(".button-submit");
        if (submitBtn) {
          submitBtn.classList.add("button-loading", "disabled");
        }

        // Get form data - no longer need author input, use current user
        const content = commentForm.elements["content"].value;
        const user = getCurrentUser();
        const author = user.username; // Use logged-in user's username

        // Add comment using apiService
        apiService
          .getImageByIndex(getGalleryOwner(), getCurrentImageIdx())
          .then((image) => {
            return apiService.addComment(image.id, author, content);
          })
          .then(() => {
            if (submitBtn) {
              submitBtn.classList.remove("button-loading", "disabled");
            }
            // Reset form
            commentForm.reset();
            // Reset comment page to 0 to show the new comment
            setCommentPageNumber(0);
            // Reload comments to show the new comment
            loadImageComments();
          })
          .catch((error) => {
            if (submitBtn) {
              submitBtn.classList.remove("button-loading", "disabled");
            }
            alert("Error posting comment: " + error.message);
          });
      });
    }
  }

  // Set up gallery navigation buttons (only once)
  function setupGalleryNavigation() {
    // Handle image left/right button clicks
    const leftBtn = document.querySelector("#imageLeftButton");
    const rightBtn = document.querySelector("#imageRightButton");

    if (leftBtn && !leftBtn.hasAttribute("data-listener-added")) {
      leftBtn.setAttribute("data-listener-added", "true");
      leftBtn.addEventListener("click", function () {
        if (getCurrentImageIdx() > 0) {
          setCurrentImageIdx(getCurrentImageIdx() - 1);
          setCommentPageNumber(0);
        }
      });
    }

    if (rightBtn && !rightBtn.hasAttribute("data-listener-added")) {
      rightBtn.setAttribute("data-listener-added", "true");
      rightBtn.addEventListener("click", function () {
        if (getCurrentImageIdx() < getImageCount() - 1) {
          setCurrentImageIdx(getCurrentImageIdx() + 1);
          setCommentPageNumber(0);
        }
      });
    }

    // Set up delete button
    const deleteBtn = document.querySelector("#imageDeleteButton");
    if (deleteBtn && !deleteBtn.hasAttribute("data-listener-added")) {
      deleteBtn.setAttribute("data-listener-added", "true");
      // Only show delete button if user is the gallery owner
      const user = getCurrentUser();
      if (user && user.username === getGalleryOwner()) {
        deleteBtn.classList.remove("hidden");

        deleteBtn.addEventListener("click", function () {
          if (
            getCurrentImageIdx() >= 0 &&
            getCurrentImageIdx() < getImageCount()
          ) {
            deleteBtn.classList.add("button-loading", "disabled");
            apiService
              .getImageByIndex(getGalleryOwner(), getCurrentImageIdx())
              .then((image) => {
                apiService.deleteImage(image.id).then(() => {
                  apiService.getImageCount(getGalleryOwner()).then((count) => {
                    setImageCount(count);
                    if (count === 0) {
                      setCurrentImageIdx(0);
                    } else {
                      setCurrentImageIdx(
                        Math.min(getCurrentImageIdx(), count - 1),
                      );
                    }
                  });
                });
              });
          }
        });
      } else {
        deleteBtn.classList.add("hidden");
      }
    }

    // Handle comment section left/right button clicks for pagination
    const commentLeftBtn = document.querySelector("#commentLeftButton");
    const commentRightBtn = document.querySelector("#commentRightButton");

    if (commentLeftBtn && !commentLeftBtn.hasAttribute("data-listener-added")) {
      commentLeftBtn.setAttribute("data-listener-added", "true");
      commentLeftBtn.addEventListener("click", function () {
        if (getCommentPageNumber() > 0) {
          setCommentPageNumber(getCommentPageNumber() - 1);
        }
      });
    }

    if (
      commentRightBtn &&
      !commentRightBtn.hasAttribute("data-listener-added")
    ) {
      commentRightBtn.setAttribute("data-listener-added", "true");
      commentRightBtn.addEventListener("click", function () {
        apiService
          .getImageByIndex(getGalleryOwner(), getCurrentImageIdx())
          .then((image) => {
            apiService
              .getImageComments(image.id, getCommentPageNumber() + 1)
              .then((imageComments) => {
                if (imageComments.length > 0) {
                  setCommentPageNumber(getCommentPageNumber() + 1);
                }
              });
          });
      });
    }
  }

  // Consolidated function to load all gallery data
  function loadGalleryData() {
    // Load image count and update UI
    apiService.getImageCount(getGalleryOwner()).then((count) => {
      setImageCount(count);
      updateImageCounter();
      updateImageInfo();
      updateCommentFormLock();
      // Comments will be loaded by useEffect when dependencies change
    });
  }

  // Update image counter display
  function updateImageCounter() {
    const imageNumberElem = document.querySelector("#imageNumber");
    if (imageNumberElem) {
      if (getImageCount() <= 0) {
        imageNumberElem.textContent = "0/0";
      } else {
        imageNumberElem.textContent =
          getCurrentImageIdx() + 1 + "/" + getImageCount();
      }
    }
  }

  // Load and display image comments
  function loadImageComments() {
    apiService
      .getImageByIndex(getGalleryOwner(), getCurrentImageIdx())
      .then((image) => {
        const imageId = image ? image.id : 0;
        const pageNumber = getCommentPageNumber();

        // Check if user is authenticated before loading comments
        if (!getCurrentUser()) {
          const commentContainer = document.querySelector(".comment-container");
          if (commentContainer) {
            commentContainer.innerHTML =
              '<p class="preview-text no-comments-message">Please log in to view comments.</p>';
          }
          return;
        }

        // Load and display comments for this image
        const commentContainer = document.querySelector(".comment-container");
        if (commentContainer) {
          commentContainer.innerHTML =
            '<p class="preview-text no-comments-message">Loading comments...</p>';
          apiService
            .getImageComments(imageId, pageNumber)
            .then((imageComments) => {
              if (imageComments.length === 0) {
                if (pageNumber > 0) {
                  setCommentPageNumber(getCommentPageNumber() - 1);
                  return;
                }
                commentContainer.innerHTML =
                  '<p class="preview-text no-comments-message">No comments yet.</p>';
                return;
              }
              commentContainer.innerHTML = "";
              imageComments.forEach((comment) => {
                const commentDiv = document.createElement("div");
                commentDiv.classList.add("comment");
                // Format date to a readable string
                const dateObj = new Date(comment.date);
                const formattedDate = dateObj.toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                // Only show delete button if current user is the gallery owner OR the comment author
                const user = getCurrentUser();
                const showDeleteBtn =
                  user &&
                  (user.username === getGalleryOwner() ||
                    user.username === comment.author);

                commentDiv.innerHTML = `
                <div class="comment-header">
                  <p class="text-bold">${comment.author}</p>
                  <div class="button-container">
                  ${showDeleteBtn ? '<div class="button button-delete"></div>' : ""}
                  </div>
                </div>
                <p class="text-regular preview-text">${formattedDate}</p>
                <p class="text-regular">${comment.content}</p>
                `;

                // Only add delete functionality if button exists
                if (showDeleteBtn) {
                  const deleteBtn = commentDiv.querySelector(".button-delete");
                  deleteBtn.addEventListener("click", function () {
                    deleteBtn.classList.add("button-loading", "disabled");
                    apiService.deleteComment(comment.id).then(() => {
                      // Reload comments to show updated list
                      loadImageComments();
                    });
                  });
                }

                commentContainer.appendChild(commentDiv);
              });
            })
            .catch((error) => {
              console.error("Error loading comments:", error);
              commentContainer.innerHTML =
                '<p class="preview-text no-comments-message">Error loading comments. Please try again.</p>';
            });
        }
      });
  }

  // Function to update owner-only buttons visibility and gallery title
  function updateOwnerButtons() {
    const postBtn = document.querySelector("#postButton");
    const deleteBtn = document.querySelector("#imageDeleteButton");
    const galleryTitle = document.querySelector("#galleryTitle");
    const user = getCurrentUser();
    const isOwner = user && user.username === getGalleryOwner();

    if (postBtn) {
      postBtn.classList.toggle("hidden", !isOwner);
    }

    if (deleteBtn) {
      deleteBtn.classList.toggle("hidden", !isOwner);
    }

    if (galleryTitle) {
      galleryTitle.textContent = `${getGalleryOwner()}'s Gallery`;
    }
  }

  // Move these functions to global scope so they can be accessed from anywhere
  function updateCommentFormLock() {
    const commentForm = document.querySelector("#postCommentForm");
    if (commentForm) {
      const hasImages = getImageCount() > 0;
      const isLoggedIn = getCurrentUser() !== null;
      const shouldEnable = hasImages && isLoggedIn;

      Array.from(commentForm.elements).forEach((el) => {
        el.disabled = !shouldEnable;
      });

      // Update placeholder text to indicate login requirement
      const textarea = commentForm.querySelector('textarea[name="content"]');
      if (textarea) {
        if (!isLoggedIn) {
          textarea.placeholder = "Please log in to comment";
        } else if (!hasImages) {
          textarea.placeholder = "No images to comment on";
        } else {
          textarea.placeholder = "Enter your comment";
        }
      }
    }
  }

  // Function to update authentication navigation
  function updateAuthNav() {
    const authNav = document.getElementById("authNav");
    if (!authNav) return;

    const user = getCurrentUser();
    if (user) {
      authNav.innerHTML = `
        <a class="text-regular">Welcome, ${user.username}!</a>
        <a href="#" onclick="event.preventDefault(); handleLogout()" class="text-regular link">Logout</a>
        <a href="#" onclick="event.preventDefault(); router.navigate('credits')" class="text-regular link">Credits</a>
      `;
    } else {
      authNav.innerHTML = `
        <a href="#" onclick="event.preventDefault(); router.navigate('login')" class="text-regular link">Login</a>
        <a href="#" onclick="event.preventDefault(); router.navigate('signup')" class="text-regular link">Sign Up</a>
        <a href="#" onclick="event.preventDefault(); router.navigate('credits')" class="text-regular link">Credits</a>
      `;
    }

    // Update form locks and button visibility whenever auth state changes
    setTimeout(() => {
      updateCommentFormLock();
      updateOwnerButtons();
    }, 0);
  }

  // Function to initialize login events
  window.initializeLoginEvents = function () {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const username = formData.get("username");
        const password = formData.get("password");
        const errorDiv = document.getElementById("loginError");

        // Clear previous errors
        errorDiv.textContent = "";

        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Logging in...";
        submitBtn.disabled = true;

        apiService
          .login(username, password)
          .then((user) => {
            setCurrentUser(user);
            updateAuthNav();
            router.navigate("home");
          })
          .catch((error) => {
            errorDiv.textContent = error.message;
          })
          .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          });
      });
    }
  };

  // Function to initialize signup events
  window.initializeSignupEvents = function () {
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
      signupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(signupForm);
        const username = formData.get("username");
        const password = formData.get("password");
        const passwordConfirm = formData.get("passwordConfirm");
        const errorDiv = document.getElementById("signupError");

        // Clear previous errors
        errorDiv.textContent = "";

        // Validate password confirmation
        if (password !== passwordConfirm) {
          errorDiv.textContent = "Passwords do not match";
          return;
        }

        // Show loading state
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Creating account...";
        submitBtn.disabled = true;

        apiService
          .signup(username, password)
          .then((user) => {
            setCurrentUser(user);
            updateAuthNav();
            router.navigate("home");
          })
          .catch((error) => {
            errorDiv.textContent = error.message;
          })
          .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          });
      });
    }
  };

  // Global logout function
  window.handleLogout = function () {
    apiService
      .logout()
      .then(() => {
        setCurrentUser(null);
        updateAuthNav();
        router.navigate("home");
      })
      .catch((error) => {
        console.error("Logout error:", error);
        // Still clear local state even if server logout fails
        setCurrentUser(null);
        updateAuthNav();
        router.navigate("home");
      });
  };

  // Check authentication status on app load
  function checkAuthStatus() {
    apiService
      .getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        setTimeout(updateAuthNav, 100); // Delay to ensure DOM is ready
      })
      .catch(() => {
        setCurrentUser(null);
        setTimeout(updateAuthNav, 100);
      });
  }

  // Initialize the SPA when DOM is loaded
  document.addEventListener("DOMContentLoaded", function () {
    router.init();
    checkAuthStatus();
  });

  // Function to initialize home events - called by router when home view loads
  // Function to view a specific user's gallery
  window.viewUserGallery = function (username) {
    setGalleryOwner(username);
    router.navigate("gallery");
  };

  window.initializeHomeEvents = function () {
    // Update auth navigation
    setTimeout(updateAuthNav, 0);

    // Load and display all users for the current page
    loadUsersPage();
  };

  // Separate function to load users for a specific page
  function loadUsersPage() {
    const usersGrid = document.getElementById("usersGrid");
    if (!usersGrid) return;

    usersGrid.innerHTML = '<p class="loading-text">Loading users...</p>';
    const homePageNumberElem = document.querySelector("#homePageNumber");
    if (homePageNumberElem) {
      homePageNumberElem.textContent = `Loading page...`;
    }

    apiService
      .getUsers(getHomePageNumber())
      .then((data) => {
        const totalPages =
          data.totalCount > 0 ? Math.ceil(data.totalCount / 12) : 1;
        setHomePageCount(totalPages);

        if (homePageNumberElem) {
          homePageNumberElem.textContent = `Page ${getHomePageNumber() + 1} of ${totalPages}`;
        }

        if (data.users && data.totalCount > 0) {
          usersGrid.innerHTML = data.users
            .map(
              (user) => `
            <div class="user-card">
              <h3 class="text-bold">${user.username}</h3>
              <button onclick="viewUserGallery('${user.username}')" class="button button-gallery text-regular">View Gallery</button>
            </div>
          `,
            )
            .join("");
        } else {
          usersGrid.innerHTML =
            '<p class="no-users-message">No users found.</p>';
        }
      })
      .catch((error) => {
        console.error("Error loading users:", error);
        usersGrid.innerHTML =
          '<p class="error-message">Error loading users.</p>';
      });
  }

  // Set up home page navigation event listeners (only once) - make it global
  window.setupHomePageNavigation = function () {
    const homeLeftBtn = document.querySelector("#homeGalleryLeftButton");
    const homeRightBtn = document.querySelector("#homeGalleryRightButton");

    if (homeLeftBtn && !homeLeftBtn.hasAttribute("data-listener-added")) {
      homeLeftBtn.setAttribute("data-listener-added", "true");
      homeLeftBtn.addEventListener("click", function () {
        if (getHomePageNumber() > 0) {
          setHomePageNumber(getHomePageNumber() - 1);
        }
      });
    }

    if (homeRightBtn && !homeRightBtn.hasAttribute("data-listener-added")) {
      homeRightBtn.setAttribute("data-listener-added", "true");
      homeRightBtn.addEventListener("click", function () {
        if (getHomePageNumber() < getHomePageCount() - 1) {
          setHomePageNumber(getHomePageNumber() + 1);
        }
      });
    }
  };

  // Use effect to handle home page number changes
  meact.useEffect(() => {
    // Only load users page if we're currently on the home view
    const currentPath = window.location.pathname;
    if (currentPath === "/" || currentPath === "/home") {
      loadUsersPage();
      // Set up navigation buttons when home page loads
      setTimeout(window.setupHomePageNavigation, 0);
    }
  }, [homePageNumber]);

  // Set image info from database
  function updateImageInfo() {
    const mainImg = document.querySelector("#image");
    if (mainImg) {
      mainImg.src = "media/loading.gif";
      mainImg.alt = "Loading";
    }
    const titleElem = document.querySelector("#imageTitle");
    if (titleElem) titleElem.textContent = "Loading...";
    const authorElem = document.querySelector("#imageAuthor");
    if (authorElem) authorElem.textContent = "";
    apiService
      .getImageByIndex(getGalleryOwner(), getCurrentImageIdx())
      .then((img) => {
        const deleteBtn = document.querySelector("#imageDeleteButton");
        if (deleteBtn) {
          deleteBtn.classList.remove("button-loading", "disabled");
        }
        if (mainImg) {
          if (img) {
            mainImg.src = "/api/images/" + img.id + "/file";
            mainImg.alt = img.title;
          } else {
            mainImg.src = "media/placeholder.png";
            mainImg.alt = "";
          }
        }
        // Update title
        if (titleElem) titleElem.textContent = img ? img.title : "N/A";
        // Update author
        if (authorElem)
          authorElem.textContent = img
            ? "Posted by: " + img.author
            : "Posted by: N/A";
      });
  }

  // Use effect to handle gallery owner and current user changes
  meact.useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === "/gallery") {
      updateOwnerButtons();
      // Reset to first image and reload gallery when gallery owner changes
      setCurrentImageIdx(0);
      setCommentPageNumber(0);
    }
  }, [currentUser, galleryOwner]);

  // Use effect to handle image index changes - loads gallery data including comments
  meact.useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === "/gallery") {
      updateImageCounter();
      updateImageInfo();
      updateCommentFormLock();
      loadImageComments(); // Load comments when image changes
    }
  }, [currentImageIdx, galleryOwner]);

  // Use effect to handle comment page changes only - just reload comments
  meact.useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === "/gallery" && getCommentPageNumber() > 0) {
      // Only reload comments when comment page changes (not on initial load)
      loadImageComments();
    }
  }, [commentPageNumber]);

  // Use effect to handle authentication changes - reload comments when user logs in/out
  meact.useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === "/gallery") {
      loadImageComments(); // Reload comments when auth state changes
    }
  }, [currentUser]);
})();
