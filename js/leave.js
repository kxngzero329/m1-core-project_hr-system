// Block access if not logged in then redirects you to the login page
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}