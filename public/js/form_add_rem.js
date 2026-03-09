
// document.addEventListener("DOMContentLoaded", function() {
//     let formsetContainer = document.getElementById("formset-container");
//     let addFormButton = document.getElementById("add-form");
//     let totalForms = document.querySelector("#id_values-TOTAL_FORMS");  // Management form

//     addFormButton.addEventListener("click", function() {
//         let formCount = parseInt(totalForms.value);  // Get the current number of forms
//         let newForm = formsetContainer.querySelector(".formset-item").cloneNode(true); // Clone existing form
        
//         // Update input names & IDs to avoid duplicate fields
//         newForm.innerHTML = newForm.innerHTML.replace(/values-(\d+)-/g, `values-${formCount}-`);
        
//         // Clear input values
//         newForm.querySelectorAll("input").forEach(input => input.value = "");

//         // Append new form to container
//         formsetContainer.appendChild(newForm);

//         // Update management form count
//         totalForms.value = formCount + 1;
//     });

//     // Allow removing a form
//     formsetContainer.addEventListener("click", function(event) {
//         if (event.target.classList.contains("remove-form")) {
//             event.target.parentElement.remove();
//             totalForms.value = parseInt(totalForms.value) - 1;
//         }
//     });
// });

