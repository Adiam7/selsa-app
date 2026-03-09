// document.addEventListener("DOMContentLoaded", function () {
//     let sizeSelect = document.getElementById("size");
//     let colorSelect = document.getElementById("color");
//     let galleryThumbs = document.getElementById("gallery-thumbs");

//     function updateGallery() {
//         let selectedSize = sizeSelect.value;
//         let selectedColor = colorSelect.value;
//         let urlParams = new URLSearchParams(window.location.search);
//         if (selectedSize) urlParams.set("size", selectedSize);
//         if (selectedColor) urlParams.set("color", selectedColor);

//         fetch(window.location.pathname + "?" + urlParams.toString())
//             .then(response => response.text())
//             .then(html => {
//                 let parser = new DOMParser();
//                 let doc = parser.parseFromString(html, "text/html");
//                 let newGallery = doc.getElementById("gallery-thumbs").innerHTML;
//                 galleryThumbs.innerHTML = newGallery;
//             });
//     }

//     sizeSelect.addEventListener("change", updateGallery);
//     colorSelect.addEventListener("change", updateGallery);
// });
