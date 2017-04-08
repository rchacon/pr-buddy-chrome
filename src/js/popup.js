function getPrs(token, repo) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      var jsonData = JSON.parse(xhr.responseText);

      var content, link, listItem, pr = null;
      for (var i = 0; i < jsonData.length; i++) {
        pr = jsonData[i];

        link = document.createElement("a");
        link.setAttribute("href", pr["html_url"]);
        content = "<span>" + pr["user"]["login"] + "</span><br>";
        content += pr["title"] + "<br>";
        content += "<span>" + repo.split("/")[1] + "</span><br>";
        content += "<span>" + pr["created_at"] + "</span>";
        link.innerHTML = content;

        listItem = document.createElement("li");
        listItem.appendChild(link);

        prList.appendChild(listItem);
      }        
    }
  };

  var prList = document.getElementById("pr-list");
  
  xhr.open("GET", "https://api.github.com/repos/" + repo + "/pulls");    

  xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");
  xhr.setRequestHeader("Authorization", "token " + token);
  
  xhr.send();
}


document.addEventListener('DOMContentLoaded', function() {
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
        getPrs(items.githubToken, items.githubRepos[i]);
      }
    }
  });
});
