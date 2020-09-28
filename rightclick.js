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
    console.log("You have selected "+$(this).text() + " " + rtmuser);
});