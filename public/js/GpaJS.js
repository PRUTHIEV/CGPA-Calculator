const selectBar = document.querySelector(".dropdown-subjects");

var gpaBox = document.querySelector(".gpa-val-box");
var gpaBoxSave = document.querySelector("#gpa-div-save");
var gpaBoxClose = document.querySelector("#gpa-div-close");
var formSaveName = document.querySelector("#input-save-name");
var inputSaveName = document.querySelector("#input-save");

document.querySelector(".gpa-icon").addEventListener("mouseover", function () {
  document.querySelector(".gpa-icon").style.cursor = "pointer";
});
document.querySelector(".gpa-icon").addEventListener("click", function () {
  location.assign("/gpa");
});
document.querySelector(".cgpa-icon").addEventListener("mouseover", function () {
  document.querySelector(".cgpa-icon").style.cursor = "pointer";
});
document.querySelector(".cgpa-icon").addEventListener("click", function () {
  location.assign("/cgpa");
});

selectBar.addEventListener("change", function () {
  console.log("Changed Occured");
  isSaveDialog = true;
  selectBar.form.submit();
});

gpaBoxSave.addEventListener("click", function () {
  if (formSaveName.style.display != "inline-block") {
    formSaveName.style.display = "inline-block";
    gpaBox.style.height = "12rem";
  } else {
    formSaveName.submit();
  }
});

gpaBoxClose.addEventListener("click", function () {
  gpaBox.style.display = "none";
});
