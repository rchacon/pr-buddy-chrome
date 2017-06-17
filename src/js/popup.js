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

document.addEventListener('DOMContentLoaded', main);
