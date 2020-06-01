var oauth = "";
var clientId = "19zxsc0tdoskzsippzkn7dlr2xq9om";

$(document).ready(function () {
    LoadOptions();

    $("#newStream").keypress(function (e) {
        if (e.which == 13) {
            var newStream = $("#newStream").val();

            AddStream([newStream], false);
        }
    });

    $("#newStreamGameplay").keypress(function (e) {
        if (e.which == 13) {
            var newStream = $("#newStreamGameplay").val();

            AddStream([newStream], true)
        }

    });

    $("#streamsTable").on('click', 'tr', function () {
        var r = confirm($(this)[0].innerText + " wirklich löschen?");
        if (r == true) {
            streams.splice($(this).index(), 1);
            $(this).remove();

            SaveStreams();
        }
    });

    $("#streamsTableGameplay").on('click', 'tr', function () {
        var r = confirm($(this)[0].innerText + " wirklich löschen?");
        if (r == true) {
            streamsGameplay.splice($(this).index(), 1);
            $(this).remove();

            SaveStreams();
        }
    });

    $('#cuteCheckbox').change(function () {
        //chrome.storage.local.set({ '9gagCute': $(this).is(':checked') });
        window.localStorage.setItem('9gagCute', $(this).is(':checked').toString());
    });

    $('#backgroundURL').change(function () {
        $("body").css("background-image", "url(" + $(this).val() + ")");
        //chrome.storage.local.set({ 'backgroundURL': $(this).val() });
        window.localStorage.setItem('backgroundURL', $(this).val());
    });

});

function AddStream(newStreams, gameplay) {
    var newStreamsString = newStreams.join("&login=");

    $.ajax({
        url: 'https://api.twitch.tv/helix/users?login=' + newStreamsString,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response['data'].length == 0) {
                alert("Stream nicht gefunden.");
            }
            else {
                var streamsList = null

                if (gameplay == true)
                    streamsList = streamsGameplay;
                else
                    streamsList = streams;

                $.each(response['data'], function (i, item) {
                    
                    if (streamsList.indexOf(item['id']) == -1) {
                        streamsList.push(item['id']);

                        var $tr = $('<tr class="rows">').append($('<td>').text(item['display_name']));

                        if (gameplay == true) {
                            $tr.appendTo('#streamsTableGameplay');
                            $("#newStreamGameplay").val("");
                        }
                        else {
                            $tr.appendTo('#streamsTable');
                            $("#newStream").val("");
                        }

                    }
                    else {
                        alert("Stream bereits vorhanden.");
                    }
                });
                
                SaveStreams();
            }
        },
        headers: {
            'Authorization': 'Bearer ' + oauth,
            'Client-ID': clientId
        },
    });
}

var streams = [];
var streamsGameplay = [];

function LoadOptions() {

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
                    var $tr = $('<tr class="rows">').append(
                        $('<td>').text(item['display_name'])
                    );
                    $tr.appendTo('#streamsTable');

                    streams.push(item['id']);
                });

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
                    var $tr = $('<tr class="rows">').append(
                        $('<td>').text(item['display_name'])
                    );
                    $tr.appendTo('#streamsTableGameplay');

                    streamsGameplay.push(item['id']);
                });

            },
            headers: {
                'Authorization': 'Bearer ' + oauth,
                'Client-ID': clientId
            },
        });

        if (window.localStorage.getItem('9gagCute') == 'true') {
            $('#cuteCheckbox').prop("checked", true);
        }

        var bgresult = window.localStorage.getItem('backgroundURL');
        if (bgresult && bgresult != "") {
            $('#backgroundURL').val(bgresult);
            $("body").css("background-image", "url(" + bgresult + ")");
        }
}

function SaveStreams() {
    window.localStorage.setItem('streams', streams.toString());
    window.localStorage.setItem('streamsGameplay', streamsGameplay.toString());
}

function ImportStreams(streams, gameplay) {
    var streamList = streams.split(',');
    AddStream(streamList, gameplay);
}

function ImportStreamIds(streamIds, gameplay) {
    if (gameplay)
        window.localStorage.setItem('streamsGameplay', streamIds);
    else
        window.localStorage.setItem('streams', streamIds);

    LoadOptions();
}

function ExportStreamIds(gameplay) {
    var exportStreams = "";
    if (gameplay)
        exportStreams = streamsGameplay.join(",");
    else
        exportStreams = streams.join(",");

    $("#newStream").val(exportStreams);
    $("#newStream").select();
    document.execCommand("copy");
    $("#newStream").val("");
}