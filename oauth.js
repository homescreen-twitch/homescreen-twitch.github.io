$(document).ready(function () {
    arr = window.location.hash.split("&")
    .map(v => v.split("=")).reduce( (pre, [key, value]) => ({ ...pre, [key]: value }), {} );
    console.log(arr['#access_token']);
    window.localStorage.setItem('oauth', arr['#access_token']);

    window.location = window.location.origin;

});