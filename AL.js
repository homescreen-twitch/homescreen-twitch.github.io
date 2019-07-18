var requestStreams = {};
var gamesCache = {};

var streams = null;

var alternateStreams= [
    38009892, // rredfox_x
    263574013, // bastiigaming
    29157943, // hc_dizee
    76792680, // AstorPewPew
    132793370, // TacolineTV
    233429987, // mibbi
    120184785, // chefkochx
    137907801, // dekarldent
    100164086, // nayuma
    64756920, // gerrit
    89896510, // jay_corner
    99121518, // torrotourettetv
    10665819, // hol1c
    58301987,  // furkitv
    107342590, // tamaaa
    138490205, // cocobane
    48865821, // staiy
    92155465, // nyndolgg
    120678931, // Hansenstreams
    68607947, // jaydenplys
    139371321 // junioranitv
];

var streamsOnline = [];
var currentDate = Date.now();

var currentTooltip = null;

var streamTimer = setInterval(() => { UpdateStreams(); }, 60000);

window.onblur = function () {
    HideTooltip();
};

$(document).ready(function () {
    LoadOptions();
});



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

    currentTooltip.style.left = (offsets.left + 290) + "px";
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

    streamsString = alternateStreams;
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
        headers: {
            'Client-ID': 'jzkbprff40iqj646a697cyrvl0zt2m6'
        },
    });


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
            'Client-ID': 'jzkbprff40iqj646a697cyrvl0zt2m6'
        },
        gameplay: false
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

            var link = document.createElement("a");
            link.setAttribute('href', "twitch://http://www.twitch.tv/" + streamData['name']);
            var divbox = document.createElement('div');
            divbox.setAttribute('class', 'tooltip');
            divbox.innerHTML = streamData['display_name'] + " - " + item['viewer_count'] + "<br /><i>" + item['title'] + "</i><br /><img style=\"margin-bottom: 23px; float: bottom;\" src=\"https://static-cdn.jtvnw.net/previews-ttv/live_user_" + streamData['name'].toLowerCase() + "-320x180.jpg?" + currentDate + "\">";

            link.appendChild(divbox);

            wrapperDiv.appendChild(link);
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
            var newHeight = 23 + Math.ceil(twitchResp['data'].length / 6) * 321;
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
                'Client-ID': 'jzkbprff40iqj646a697cyrvl0zt2m6'
            },
        });
    });

    return p1;
}