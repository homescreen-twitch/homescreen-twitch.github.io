var requestStreams = {};
var requestStreamsGameplay = {};
var gamesCache = {};

var streams = null;
var streamsGameplay = null;

var streamsOnline = [];
var currentDate = Date.now();

var currentTooltip = null;

var clockTimer = setInterval(() => { TimerTimeUpdate(); }, 1000);
var streamTimer = setInterval(() => { UpdateStreams(); UpdateStreamsGameplay(); }, 60000);

var oauth = "";
var clientId = "19zxsc0tdoskzsippzkn7dlr2xq9om";

Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
}

window.onfocus = function () {
    TimerTimeUpdate();
    clockTimer = setInterval(function () { TimerTimeUpdate() }, 1000);
};

window.onblur = function () {
    clearInterval(clockTimer);
    HideTooltip();
};

$(document).ready(function () {
    TimerTimeUpdate();
    LoadOptions();


    $("#reloadButton").on('click', () => {
        UpdateStreams();
    });
});



function TimerTimeUpdate() {
    var newDate = new Date();

    $("#timeText").text(newDate.timeNow());
}



function ShowTooltip(element, number, gameplay) {
    var offsets = element.getBoundingClientRect();

    var name = "";
    var display_name = "";
    var game = "";
    var title = "";
    var viewer = "";

    var id = 0;

    if (gameplay) {
        id = streamsGameplay[number]['user_id'];

        name = requestStreamsGameplay[id]['name'];
        display_name = requestStreamsGameplay[id]['display_name'];
        game = gamesCache[streamsGameplay[number]['game_id']];
        title = streamsGameplay[number]['title'];
        viewer = streamsGameplay[number]['viewer_count'];
    } else {
        id = streams[number]['user_id'];

        name = requestStreams[id]['name'];
        display_name = requestStreams[id]['display_name'];
        game = gamesCache[streams[number]['game_id']];
        title = streams[number]['title'];
        viewer = streams[number]['viewer_count'];
    }

    currentTooltip = document.getElementById("tooltip");
    currentTooltip.innerHTML = display_name + "<br />" + game + "<br />" + viewer + "<br /><br /><i>" + title + "</i><br /><img style=\"margin-bottom: 23px; float: bottom;\" src=\"https://static-cdn.jtvnw.net/previews-ttv/live_user_" + name.toLowerCase() + "-320x180.jpg?" + currentDate + "\">";

    currentTooltip.style.left = (offsets.left + 90) + "px";
    currentTooltip.style.top = (offsets.top - 150) + "px";
    currentTooltip.style.display = "block"
}

function HideTooltip() {
    if (currentTooltip == null)
        return;

    currentTooltip.style.display = "none";
    currentTooltip.innerHTML = "";
    currentTooltip = null;
}



function ShowNewNotification(image, display_name, name, content) {
    return;
    
    new Notification(display_name, {
        body: content,
        icon: image
      });
    /*
    chrome.notifications.create(name, {
        type: 'basic',
        iconUrl: image,
        title: display_name,
        message: content
    }, function (notificationId) {
        setTimeout(() => {
            chrome.notifications.clear(notificationId, null);
        }, 3000);
    });
    */
}



function LoadOptions() {
    window.Notification.requestPermission();

    oauth = window.localStorage.getItem('oauth');
    if (oauth == null) {
        window.location = "https://id.twitch.tv/oauth2/authorize?client_id=19zxsc0tdoskzsippzkn7dlr2xq9om&redirect_uri=https%3A%2F%2Fhomescreen-twitch.github.io%2Foauth.html&response_type=token"
    }

    streamsString = window.localStorage.getItem('streams').split(',');
    $.ajax({
        url: 'https://api.twitch.tv/helix/users?id=' + streamsString.join('&id='),
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            $.each(response['data'], function (i, item) {
                requestStreams[item['id']] = { name: item['login'], display_name: item['display_name'], image: item['profile_image_url'] };
            });

            UpdateStreams();
        },
        fail: function(response) {
            window.localStorage.removeItem('oauth');
            window.location = "https://id.twitch.tv/oauth2/authorize?client_id=19zxsc0tdoskzsippzkn7dlr2xq9om&redirect_uri=https%3A%2F%2Fhomescreen-twitch.github.io%2Foauth.html&response_type=token"

        },
        headers: {
            'Authorization': 'Bearer ' + oauth,
            'Client-ID': clientId
        },
    });

    streamsString = window.localStorage.getItem('streamsGameplay').split(',');
    $.ajax({
        url: 'https://api.twitch.tv/helix/users?id=' + streamsString.join('&id='),
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            $.each(response['data'], function (i, item) {
                requestStreamsGameplay[item['id']] = { name: item['login'], display_name: item['display_name'], image: item['profile_image_url'] };
            });

            UpdateStreamsGameplay();
        },
        headers: {
            'Authorization': 'Bearer ' + oauth,
            'Client-ID': clientId
        },
    });

    if (window.localStorage.getItem('9gagCute') == 'true') {
        $('a[href$="https://www.9gag.com"]').attr("href", "https://www.9gag.com/cute")
    }

    var bgresult = window.localStorage.getItem('backgroundURL');
    if (bgresult && bgresult != "") {
        $("body").css("background-image", "url(" + bgresult + ")");
    }
}



function UpdateStreams() {
    requestString = Object.keys(requestStreams).join("&user_id=");
    $.ajax({
        url: 'https://api.twitch.tv/helix/streams?first=100&user_id=' + requestString,
        type: 'GET',
        dataType: 'json',
        success: UpdateStreamsResponse,
        headers: {
            'Authorization': 'Bearer ' + oauth,
            'Client-ID': clientId
        },
        gameplay: false
    });
}

function UpdateStreamsGameplay() {
    requestString = Object.keys(requestStreamsGameplay).join("&user_id=");
    $.ajax({
        url: 'https://api.twitch.tv/helix/streams?first=100&user_id=' + requestString,
        type: 'GET',
        dataType: 'json',
        success: UpdateStreamsResponse,
        headers: {
            'Authorization': 'Bearer ' + oauth,
            'Client-ID': clientId
        },
        gameplay: true
    });
}

function UpdateStreamsResponse(twitchResp) {
    var newGames = [];
    var gameplay = this['gameplay'];

    var newDate = Date.now();
    if (newDate - currentDate > 240000) {
        currentDate = newDate;
    }

    var wrapper;
    if (gameplay == true) {
        wrapper = document.getElementById("twitchGameplay");
        streamsGameplay = twitchResp['data'];
    }
    else {
        wrapper = document.getElementById("twitch");
        streams = twitchResp['data'];
    }


    if (wrapper.firstChild) {
        wrapper.removeChild(wrapper.firstChild);
    }

    if (twitchResp['data'].length > 0) {
        var tmpNames = [];

        var wrapperDiv = document.createElement('div');

        $.each(twitchResp['data'], function (x, item) {
            var id = item['user_id'];
            var streamData = null;

            if (gameplay == true)
                streamData = requestStreamsGameplay[id];
            else
                streamData = requestStreams[id];

            if (typeof gamesCache[item['game_id']] == 'undefined') {
                newGames.push(item['game_id']);
            }

            tmpNames.push(id);

            //var link = document.createElement("a");
            //link.setAttribute('href', "twitch://http://www.twitch.tv/" + streamData['name']);


            var linkIMG = document.createElement("img");
            linkIMG.setAttribute('data-streamer', streamData['name']);
            linkIMG.setAttribute('class', 'grey');
            linkIMG.setAttribute('src', streamData['image']);
            linkIMG.setAttribute('height', 80);
            linkIMG.setAttribute('width', 80);

            linkIMG.addEventListener('mouseover', function () {
                ShowTooltip(linkIMG, x, gameplay);
            });
            linkIMG.addEventListener('mouseout', HideTooltip);

            linkIMG.onclick = function() { OpenStream(streamData['name']); };

            //link.appendChild(linkIMG);
            //wrapperDiv.appendChild(link);
            wrapperDiv.appendChild(linkIMG);

        });

        var gamesPromise = UpdateGamesCache(newGames);
        gamesPromise.then(function (val) {
            var streamData = null;

            $.each(tmpNames, function (x, item) {
                if (streamsOnline.indexOf(item) == -1) {
                    //new stream, display notification
                    if (gameplay == true)
                        streamData = requestStreamsGameplay[item];
                    else
                        streamData = requestStreams[item];
                    ShowNewNotification(streamData['image'], streamData['display_name'], streamData['name'], typeof gamesCache[item['game_id']] == 'undefined' ? item['game_id'] : gamesCache[item['game_id']]);

                }
            });
        });

        wrapper.appendChild(wrapperDiv);

        if (gameplay == false) {
            streamsOnline = tmpNames;
        }


        if (wrapper.children.length != 0) {
            var newHeight = 23 + Math.ceil(twitchResp['data'].length / 6) * 103;
            wrapper.style.height = newHeight + "px";
            wrapper.style.visibility = "visible";
        }
    } else {
        if (wrapper.style.visibility == "visible") {
            wrapper.style.visibility = "hidden";
            wrapper.style.height = "0px";
        }
    }
}

function UpdateGamesCache(newGames) {
    var p1 = new Promise(function (resolve, reject) {
        if (newGames.length == 0)
            resolve();

        $.ajax({
            url: 'https://api.twitch.tv/helix/games?id=' + newGames.join("&id="),
            type: 'GET',
            dataType: 'json',
            success: function (twitchResp) {
                twitchResp['data'].forEach(function (item, x) {
                    gamesCache[item['id']] = item['name'];
                });
                resolve();
            },
            headers: {
                'Authorization': 'Bearer ' + oauth,
                'Client-ID': clientId
            },
        });
    });

    return p1;
}

function OpenStream(streamname) {
    var myWindow = window.open("https://player.twitch.tv/?channel=" + streamname + "&parent=twitch.tv&enableExtensions=false&muted=false", "_blank", "width=1489,height=839,menubar=no,scrollbars=no,status=no,titlebar=no,toolbar=no,scrollbars=no,location=no");
}