/**
 * The following code was refactored using the
 * following Github Copilot prompt and manually editted:
 *
 * Add a signup and login page.
 * Right now the program uses session cookies, refactor to use bearer tokens instead.
 *
 *
 */

let apiService = (function () {
  "use strict";

  let module = {};

  // Token management
  const TOKEN_KEY = "auth_token";

  // Get stored token
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Store token
  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Remove token
  function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Get headers with authorization
  function getAuthHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // Make authenticated fetch request
  function authFetch(url, options = {}) {
    const token = getToken();
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return fetch(url, options);
  }

  /*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author
        - (String) url
        - (Date) date

    comment objects must have the following attributes
        - (String) commentId
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date
  */

  /**
   * The following code was generated using the
   * following Github Copilot prompt and manually editted:
   *
   * When you press the Post button the form should
   * be submitted and the popup should close.
   */

  // add an image to the gallery
  module.addImage = function (formData) {
    return authFetch("/api/images/", {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          throw new Error(data.error || "Failed to add image");
        });
      }
      return res.json();
    });
  };

  /**
   * The following code was generated using Github
   * Copilot autocomplete and manually editted:
   */
  // delete an image from the gallery given its imageId
  module.deleteImage = function (imageId) {
    return authFetch(`/api/images/${imageId}`, {
      method: "DELETE",
    }).then((res) => {
      if (res.ok) {
        // Delete all comments associated with this image
        module.deleteCommentsByImageId(imageId);
      } else {
        throw new Error("Failed to delete image");
      }
    });
  };

  /**
   * The following code was generated using the
   * following Github Copilot prompt and manually editted:
   *
   * Increment the page number when the comment section
   * left and right arrows are pressed
   */

  // add a comment to an image
  module.addComment = function (imageId, author, content) {
    return authFetch("/api/comments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageId, author, content }),
    }).then((res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          throw new Error(data.error || "Failed to add comment");
        });
      }
      return res.json();
    });
  };

  // delete a comment to an image
  module.deleteComment = function (commentId) {
    return authFetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  module.deleteCommentsByImageId = function (imageId) {
    // Delete comments from the backend database
    return authFetch(`/api/comments/image/${imageId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  module.getImageByIndex = function (author, index) {
    return fetch(`/api/images/author/${author}/?offset=${index}&limit=1`)
      .then((res) => res.json())
      .then((data) => data.images[0]);
  };

  module.getImageCount = function (author) {
    return fetch(`/api/images/count/author/${author}`)
      .then((res) => res.json())
      .then((data) => data.count);
  };

  // Get paginated comments for an image
  module.getImageComments = function (imageId, pageNumber) {
    return authFetch(`/api/images/${imageId}/comments?page=${pageNumber}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch comments: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => data.comments || []);
  };

  // Authentication API methods
  module.login = function (username, password) {
    return fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || "Invalid credentials");
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          setToken(data.token);
        }
        return data;
      });
  };

  module.signup = function (username, password) {
    return fetch("/api/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || "Registration failed");
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          setToken(data.token);
        }
        return data;
      });
  };

  module.logout = function () {
    return fetch("/api/users/logout", {
      method: "POST",
      headers: getAuthHeaders(),
    })
      .then((res) => {
        removeToken(); // Remove token regardless of server response
        return res.json();
      })
      .catch(() => {
        removeToken(); // Remove token even if request fails
        return { message: "Logged out" };
      });
  };

  module.getCurrentUser = function () {
    return authFetch("/api/users/me")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            removeToken(); // Token is invalid, remove it
          }
          return null;
        }
        return res.json();
      })
      .catch(() => {
        removeToken(); // Error occurred, remove token
        return null;
      });
  };

  // Expose token management functions
  module.getToken = getToken;
  module.removeToken = removeToken;
  module.isAuthenticated = function () {
    return !!getToken();
  };

  module.getUsers = function (pageNumber = 0, pageSize = 12) {
    return fetch(
      `/api/users?offset=${pageNumber * pageSize}&limit=${pageSize}`,
    ).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      return res.json();
    });
  };

  return module;
})();
