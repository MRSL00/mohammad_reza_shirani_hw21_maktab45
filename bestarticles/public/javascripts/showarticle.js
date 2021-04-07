$(document).ready(function () {
  const img = $(".jumbotron").attr('id');
  
  $(".jumbotron").css({"background-image": "url(" + img + ")"});
});
