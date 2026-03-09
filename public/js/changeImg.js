// console.log("JS Loaded 🚀");
// document.querySelectorAll('.product-option select').forEach(selectElement => {
//     selectElement.addEventListener('change', function(event) {
//         event.preventDefault();  // ✅ Stop the form from submitting!

//         const selectedOptions = {};
//         document.querySelectorAll('.product-option select').forEach(sel => {
//             selectedOptions[sel.id] = sel.value;
//         });

//         const productId = '{{ product.id }}';
//         selectedOptions['product_id'] = productId;

//         const queryString = new URLSearchParams(selectedOptions).toString();

//         fetch(`/product/get-option-image/?${queryString}`)
//             .then(response => response.json())
//             .then(data => {
//                 if (data.image_url) {
//                     document.querySelector('#main-image').src = data.image_url;
//                     document.querySelector('#product-image-filename')?.innerText = data.file_name;
//                 } else {
//                     document.querySelector('#main-image').src = "{{ default_image_url }}";
//                     document.querySelector('#product-image-filename')?.innerText = "default.jpg";
//                 }
//             })
//             .catch(err => console.error('Error fetching image:', err));
//     });
// });


document.addEventListener("DOMContentLoaded", () => {
    const mainImage = document.getElementById("main-image");
    const galleryThumbs = document.querySelectorAll(".gallery-thumb");
    const attributeSelects = document.querySelectorAll("#se-options select");

    // Helper: update the main image visually
    const setMainImage = (thumb) => {
        if (!thumb || !mainImage) return;
        const newSrc = thumb.getAttribute("src");
        const newAlt = thumb.getAttribute("alt") || "Product image";

        if (mainImage.src !== newSrc) {
            // Optional: fade transition
            mainImage.classList.add("fade-out");
            setTimeout(() => {
                mainImage.src = newSrc;
                mainImage.alt = newAlt;
                mainImage.classList.remove("fade-out");
                mainImage.classList.add("fade-in");
                setTimeout(() => mainImage.classList.remove("fade-in"), 300);
            }, 150);
        }
    };

    // Update main image based on selected attribute values
    const updateMainImageFromAttributes = () => {
        const selectedAttributes = {};

        attributeSelects.forEach(select => {
            const type = select.id.toLowerCase();  // e.g., "color"
            const value = select.value.toLowerCase(); // e.g., "red"
            if (value) {
                selectedAttributes[type] = value;
            }
        });

        // Try to find a thumbnail matching all selected attributes
        for (const thumb of galleryThumbs) {
            const thumbType = thumb.dataset.optionType?.toLowerCase();
            const thumbValue = thumb.dataset.optionValue?.toLowerCase();

            if (
                selectedAttributes[thumbType] &&
                selectedAttributes[thumbType] === thumbValue
            ) {
                setMainImage(thumb);
                break; // Stop at the first matching image
            }
        }
    };

    // Change image when a select changes
    attributeSelects.forEach(select => {
        select.addEventListener("change", updateMainImageFromAttributes);
    });

    // Change image when a thumbnail is clicked
    galleryThumbs.forEach(thumb => {
        thumb.addEventListener("click", () => setMainImage(thumb));
    });
});

