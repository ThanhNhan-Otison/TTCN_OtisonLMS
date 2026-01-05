// assets/js/guard.js
function redirectIfAuthed(to = "home.html") {
  if (localStorage.getItem("token")) {
    location.href = to;
    return true;
  }
  return false;
}
