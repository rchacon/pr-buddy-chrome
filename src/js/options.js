// Saves options to chrome.storage
function saveOptions() {
  var token = document.getElementById("token").value;
  var repos = document.getElementById("repos").value.split("\n");
  var webHookId = document.getElementById("slack-webhook-id").value;
  var channel = document.getElementById("slack-channel").value;
  chrome.storage.local.set({
    githubToken: token,
    githubRepos: repos,
    slackWebhookId: webHookId,
    slackChannel: channel
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
    githubRepos: "",
    slackWebhookId: "",
    slackChannel: ""
  }, function(items) {
    document.getElementById("token").value = items.githubToken;
    document.getElementById("repos").value = items.githubRepos.toString().replace(/,/g, "\n");
    document.getElementById("slack-webhook-id").value = items.slackWebhookId;
    document.getElementById("slack-channel").value = items.slackChannel;
  });
}


document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
