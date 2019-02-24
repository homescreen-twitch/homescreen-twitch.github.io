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
        chrome.storage.local.set({ '9gagCute': $(this).is(':checked') });
    });

    $('#backgroundURL').change(function () {
        $("body").css("background-image", "url(" + $(this).val() + ")");
        chrome.storage.local.set({ 'backgroundURL': $(this).val() });
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
            'Client-ID': 'jzkbprff40iqj646a697cyrvl0zt2m6'
        },
    });
}

var streams = [];
var streamsGameplay = [];

function LoadOptions() {
    chrome.storage.local.get(['streams', 'streamsGameplay', '9gagCute', 'backgroundURL'], function (result) {

        streamsString = result['streams'].join("&id=");
        $.ajax({
            url: 'https://api.twitch.tv/helix/users?id=' + streamsString,
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
                'Client-ID': 'jzkbprff40iqj646a697cyrvl0zt2m6'
            },
        });

        streamsString = result['streamsGameplay'].join("&id=");
        $.ajax({
            url: 'https://api.twitch.tv/helix/users?id=' + streamsString,
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
                'Client-ID': 'jzkbprff40iqj646a697cyrvl0zt2m6'
            },
        });

        if (result['9gagCute']) {
            $('#cuteCheckbox').prop("checked", true);
        }

        if (result['backgroundURL'] && result['backgroundURL'] != "") {
            $('#backgroundURL').val(result['backgroundURL']);
            $("body").css("background-image", "url(" + result['backgroundURL'] + ")");
        }
    });
}

function SaveStreams() {
    //chrome.storage.local.set({ 'streams': streams });
    //chrome.storage.local.set({ 'streamsGameplay': streamsGameplay });
    window.localStorage.setItem('streams', streams.toString());
    window.localStorage.setItem('streamsGameplay', streamsGameplay.toString());
}

function ImportStreams(streams, gameplay) {
    var streamList = streams.split(',');
    AddStream(streamList, gameplay);
}

function ImportStreamIds(streamIds, gameplay) {
    var tmpStreams = streamIds.split(",");
    if (gameplay)
        chrome.storage.local.set({ 'streamsGameplay': tmpStreams });
    else
        chrome.storage.local.set({ 'streams': tmpStreams });

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