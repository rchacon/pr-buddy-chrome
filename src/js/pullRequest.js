var pullRequest = {
  /**
   * Determines how long a pull request has been open.
   * PRs open longer than 2 days receive a warning.
   * PRs open longer than 4 days are considered in danger.
   * @param {object} pr - Pull Request object
   * @param {object} now - Date object
   */
  determineAge: function (pr, now) {
    var createdAt = new Date(pr["created_at"]);
    var delta = now - createdAt; // Get delta in milliseconds
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
        age = '1 day';
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
  },

  /**
   * Get Pull Requests from Github API.
   * @param {string} token - GitHub token with full repo access.
   * @param {string} repo - Github repo (owner/repo).
   */
  getPrs: function (token, repo) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        var jsonData = JSON.parse(xhr.responseText);

        pullRequest.renderPrs(jsonData);
      }
    };
    
    xhr.open("GET", "https://api.github.com/repos/" + repo + "/pulls");    
    xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");
    xhr.setRequestHeader("Authorization", "token " + token);
    xhr.send();
  },

  /**
   * Render list of PRs
   * @param {object} jsonData
   */
  renderPrs: function (jsonData) {
    var count = document.getElementById("count");
    var prList = document.getElementById("pr-list");

    var content, link, listItem, pr = null, age = null, createdAt;
    for (var i = 0; i < jsonData.length; i++) {
      pr = jsonData[i];

      link = document.createElement("a");
      link.setAttribute("href", pr["html_url"]);
      content = "<span>" + pr["user"]["login"] + "</span><br>";
      content += pr["title"] + "<br>";
      content += "<span>" + pr["head"]["repo"]["full_name"] + "</span><br>";
      createdAt = new Date(pr["created_at"]);
      content += "<span>" + createdAt.toDateString() + " at " + createdAt.toLocaleTimeString('en-US') + "</span>";
      link.innerHTML = content;

      age = pullRequest.determineAge(pr, new Date());

      listItem = document.createElement("li");
      listItem.className = age["status"];
      listItem.appendChild(link);

      prList.appendChild(listItem);
      count.innerHTML = prList.children.length;
    }
  }
};
