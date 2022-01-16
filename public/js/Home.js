$(".gpa-icon").hover(function () {
  $(".gpa-icon").css("cursor", "pointer");
});
$(".cgpa-icon").hover(function () {
  $(this).css("cursor", "pointer");
});
$(".gpa-icon").click(function () {
  location.assign("/gpa");
});
$(".cgpa-icon").click(function () {
  location.assign("/cgpa");
});
