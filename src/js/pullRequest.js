var CHROME_EXT_URL = "https://chrome.google.com/webstore/detail/pr-buddy/bimchafkfbfdnapifcpokgkioaicfpnd?hl=en-US&gl=US";

var pullRequest = {
  items: [],

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

        pullRequest.items = pullRequest.items.concat(jsonData);
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

      pullRequest.sortList(prList);
    }
  },

  /**
   * Sort items in list element
   * @param {object} list
   * https://www.w3schools.com/howto/howto_js_sort_list.asp
   */
  sortList: function (list) {
    var i, switching, items, shouldSwitch;
    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      items = list.getElementsByTagName("li");
      // Loop through all list items:
      for (i = 0; i < (items.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Check if the next item should
        switch place with the current item: */
        if (items[i].innerHTML.toLowerCase() > items[i + 1].innerHTML.toLowerCase()) {
          /* If next item is alphabetically lower than current item,
          mark as a switch and break the loop: */
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark the switch as done: */
        items[i].parentNode.insertBefore(items[i + 1], items[i]);
        switching = true;
      }
    }
  },

  /**
   * Build Slack text and attachments
   * @param {array} Array of PR objects
   */
  buildSlackMessage: function (prs) {
    var message;

    if (prs.length === 1) {
      message = "There is *1* pull request in *review*:";
    } else {
      message = "There are *" + prs.length + "* pull requests in *review*:";
    }

    message += "\nSent from <" + CHROME_EXT_URL + "|Chrome Extension>";

    prs.sort(function(a, b) {
      return (a.created_at > b.created_at) ? 1 : ((b.created_at > a.created_at) ? -1 : 0);
    });

    var age, repo, timestamp;
    var attachments = [];
    prs.forEach(function (pr) {
        age = pullRequest.determineAge(pr, new Date());
        repo = pr["head"]["repo"]["full_name"];
        attachments.push({
          author_icon: pr["user"]["avatar_url"],
          author_link: pr["user"]["html_url"],
          author_name: pr["user"]["login"],
          color: age.status,
          fallback: pr["title"] + " (opened " + age.age + " ago)",
          title: pr["title"],
          title_link: pr["html_url"],
          text: repo,
          ts: new Date(pr["created_at"]).getTime()/1000|0
        });
    })

    return {message: message, attachments: attachments};
  },

  /**
   * Slack list of PRs
   * @param {string} Slack Webhook ID
   * @param {string} Slack Channel
   */
  slackIt: function (webhookId, channel) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        var status = document.getElementById("status");
        status.textContent = xhr.status === 200 ? "Slack message sent" : "Error sending slack message";
        setTimeout(function() {
          status.textContent = "";
        }, 750);
      }
    };

    var message = pullRequest.buildSlackMessage(pullRequest.items);

    var data = JSON.stringify({
      text: message.message,
      attachments: message.attachments,
      channel: channel,
      username: "PR Buddy",
      icon_emoji: ":octocat:"
    });
    
    xhr.open("POST", "https://hooks.slack.com/services/" + webhookId);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
  }
};
