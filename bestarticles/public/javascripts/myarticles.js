const $button = document.querySelector("#sidebar-toggle");
const $wrapper = document.querySelector("#wrapper");

$button.addEventListener("click", (e) => {
  e.preventDefault();
  $wrapper.classList.toggle("toggled");
});

$(document).ready(function () {
  $("#delete").click(function (e) {
    e.preventDefault();
    $.ajax({
      type: "delete",
      url: $("#ArtDelUrl").attr("href"),
      success: function (response) {
        if (response) {
          alert("Article Deleted");
          $(location).attr("href", "http://localhost:5000/myarticles");
        }
      },
      error: function (err) {
        if (err) {
          alert(err.massage);
          $(location).attr("href", "http://localhost:5000/myarticles");
        }
      },
    });
  });
});
