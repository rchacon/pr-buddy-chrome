// Saves options to chrome.storage
function saveOptions() {
  var token = document.getElementById("token").value;
  var repos = document.getElementById("repos").value.split("\n");
  chrome.storage.local.set({
    githubToken: token,
    githubRepos: repos
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(function() {
      status.textContent = "";
    }, 750);
  });
}


// Restore options from chrome.storage
function restoreOptions() {
  chrome.storage.local.get({
    githubToken: "",
    githubRepos: ""
  }, function(items) {
    document.getElementById("token").value = items.githubToken;
    document.getElementById("repos").value = items.githubRepos.toString().replace(/,/g, "\n");
  });
}


document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
