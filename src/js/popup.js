/**
 * Get GitHub token and list of repos from storage then get PRs for each repo.
 */
function main () {
  chrome.storage.local.get({
    githubToken: "",
    githubRepos: ""
  }, function(items) {
    if (items.githubToken === "" || items.githubRepos === "") {
      var error = document.getElementById("error");
      error.textContent = 'You must enter a GitHub token and repo on options page.';
    } else {
      // Get PRs for all repos in chrome.storage
      for (var i = 0; i < items.githubRepos.length; i ++) {
        pullRequest.getPrs(items.githubToken, items.githubRepos[i]);
      }
    }
  });
}

/**
 * Get slack webhook ID and channel from storage and send message with list of PRs.
 */
function slackIt () {
  chrome.storage.local.get({
    slackWebhookId: "",
    slackChannel: ""
  }, function (items) {
    if (items.slackWebhookId === "" || items.slackChannel === "") {
      var error = document.getElementById("error");
      error.textContent = 'You must enter a Slack Webhook ID and Channel on the options page.';
    } else {
      pullRequest.slackIt(items.slackWebhookId, items.slackChannel);
    }
  });
}

document.addEventListener('DOMContentLoaded', main);
document.getElementById("slack-it").addEventListener("click", slackIt);
