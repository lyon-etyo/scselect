import SCSelect from "../scselect.js";

const selectElements = document.querySelectorAll("select");

selectElements.forEach(selectElement => {
  new SCSelect(selectElement);
});
