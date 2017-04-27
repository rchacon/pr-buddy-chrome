function determineAge(pr) {
  /* Determines how long a pull request has been open.
   * PRs open longer than 2 days receive a warning.
   * PRs open longer than 4 days are considered in danger.
  */
  var createdAt = new Date(pr["created_at"]);
  var delta = new Date() - createdAt; // Get delta in milliseconds
  var minutes = (delta / 1000) / 60;
  var hours = minutes / 60;
  var days = parseInt(hours / 24);

  var age = "";
  var status = "good";

  if (days > 0) {
    if (days > 1) {
      age = days + ' days';
      if (days > 2) {
        status = 'warning';
      }
      if (days > 4) {
        status = 'danger';
      }
    } else {
      age = days + ' day';
    }
  } else if (hours >= 1) {
    age = parseInt(hours) + ' hours';
  } else {
    age = parseInt(minutes) + ' minutes'; 
  }

  return {
    age: age,
    status: status
  };
}


function getPrs(token, repo) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      var jsonData = JSON.parse(xhr.responseText);

      var content, link, listItem, pr = null, age = null, createdAt;
      for (var i = 0; i < jsonData.length; i++) {
        pr = jsonData[i];

        link = document.createElement("a");
        link.setAttribute("href", pr["html_url"]);
        content = "<span>" + pr["user"]["login"] + "</span><br>";
        content += pr["title"] + "<br>";
        content += "<span>" + repo.split("/")[1] + "</span><br>";
        createdAt = new Date(pr["created_at"]);
        content += "<span>" + createdAt.toDateString() + " at " + createdAt.toLocaleTimeString('en-US') + "</span>";
        link.innerHTML = content;

        age = determineAge(pr);

        listItem = document.createElement("li");
        listItem.className = age["status"];
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
        getPrs(items.githubToken, items.githubRepos[i]);
      }
    }
  });
}


document.addEventListener('DOMContentLoaded', main);
