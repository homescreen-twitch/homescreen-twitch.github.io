$(document).bind("contextmenu",function(e){
    if ($(e.target).prop("class") == "grey") {
      e.preventDefault();
      $("#cntnr").css("left",e.pageX);
      $("#cntnr").css("top",e.pageY);
     // $("#cntnr").hide(100);        
      $("#cntnr").fadeIn(200,startFocusOut());   
    }   
});
    
function startFocusOut() {
    $(document).on("click",function(){
    $("#cntnr").hide();        
    $(document).off("click");
    });
}
    
$("#cntitems > li").click(function(){
    console.log("You have selected "+$(this).text());
});