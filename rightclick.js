var rtmuser;

$(document).bind("contextmenu",function(e){
    if ($(e.target).prop("class") == "grey") {
        rtmuser = $(e.target).data("streamer");

        e.preventDefault();
        $("#cntnr").css("left",e.pageX);
        $("#cntnr").css("top",e.pageY);        
        $("#cntnr").fadeIn(200,startFocusOut());   
    }   
});
    
function startFocusOut() {
    $(document).on("click",function(){
    $("#cntnr").hide();        
    $(document).off("click");
    });
}
    
$(document).on("click", "#cntitems > li",function(){
    switch ($(this).text()) {
        case "Chat":
            var myWindow = window.open("https://www.twitch.tv/popout/" + rtmuser + "/chat?popout=", "_blank", "width=400,height=90,menubar=no,scrollbars=no,status=no,titlebar=no,toolbar=no,scrollbars=no,location=no");
            break;
        case "Twitch Seite":
            var myWindow = window.open("https://www.twitch.tv/" + rtmuser, "_blank", "");
            break;
    }
    console.log("You have selected "+$(this).text() + " " + rtmuser);
});