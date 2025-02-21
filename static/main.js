// Toggle search and user menu
let search = document.querySelector('.search-box');
let user = document.querySelector('.user');

// Toggle search-box visibility when search icon is clicked
document.querySelector('#search-icon').onclick = () => {
    search.classList.toggle('active');
    user.classList.remove('active');
};

// Toggle user menu visibility when user icon is clicked
document.querySelector('#user-icon').onclick = () => {
    user.classList.toggle('active');
    search.classList.remove('active');
};


// Popup functionality
function togglePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.toggle('active');
}

// Close popup when clicking outside
document.addEventListener('click', function(event) {
    // Don't handle clicks on menu button or sidebar
    if (event.target.closest('#menu-button') || event.target.closest('#sidebar')) {
        return;
    }
    
    const popups = document.querySelectorAll('.popup.active');
    popups.forEach(popup => {
        if (!popup.contains(event.target) && !event.target.matches('[onclick*="togglePopup"]')) {
            popup.classList.remove('active');
        }
    });
});


// Get elements for toggling sidebar and menu button
const menuButton = document.getElementById('menu-button');
const closeButton = document.getElementById('close-button');
const sidebar = document.getElementById('sidebar');

// Toggle the sidebar visibility and menu button icon
menuButton.addEventListener('click', () => {
    sidebar.classList.add('open');
    menuButton.style.display = 'none'; // Hide the menu button
    closeButton.style.display = 'block'; // Show the close button
});

// Close the sidebar and switch back the icons when close button is clicked
closeButton.addEventListener('click', () => {
    sidebar.classList.remove('open');
    menuButton.style.display = 'block'; // Show the menu button again
    closeButton.style.display = 'none'; // Hide the close button
});


// Get sliders by their ids
const hpSlider = document.getElementById("horsepower");
const cargoSlider = document.getElementById("cargo-space");
const priceSlider = document.getElementById("price");

// Get the elements where the values will be displayed
const hpValue = document.getElementById("horsepower-value");
const cargoValue = document.getElementById("cargo-space-value");
const priceValue = document.getElementById("price-value");

// Initial values to display
hpValue.textContent = hpSlider.value + " hp";
cargoValue.textContent = cargoSlider.value + "L";
priceValue.textContent = "₱" + priceSlider.value;

// Update the displayed values dynamically when the sliders are changed
hpSlider.oninput = function() {
    hpValue.textContent = this.value + " hp";
}

cargoSlider.oninput = function() {
    cargoValue.textContent = this.value + "L";
}

priceSlider.oninput = function() {
    priceValue.textContent = "₱" + this.value;
}

// Add event listeners for dynamic updates when sliders are moved
document.getElementById("horsepower").addEventListener("input", function() {
    document.getElementById("horsepower-value").innerText = this.value + " hp";
});

document.getElementById("cargo-space").addEventListener("input", function() {
    document.getElementById("cargo-space-value").innerText = this.value + "L";
});

document.getElementById("price").addEventListener("input", function() {
    document.getElementById("price-value").innerText = "₱" + this.value;
});

// Function to update model suggestions based on selected brand
async function updateModelSuggestions() {
    const brandInput = document.getElementById('Brand');
    const modelInput = document.getElementById('Model');
    const selectedBrand = brandInput.value.trim();

    // If a brand is selected, fetch models for that brand from the Flask backend
    if (selectedBrand) {
        try {
            const response = await fetch(`http://localhost:5000/get_models_for_brand/${encodeURIComponent(selectedBrand)}`);
            const models = await response.json();

            if (models.length > 0) {
                modelInput.disabled = false;
                modelInput.setAttribute("list", "model-suggestions");

                // Clear previous suggestions and add new ones
                let dataList = document.getElementById('model-suggestions');
                if (!dataList) {
                    dataList = document.createElement('datalist');
                    dataList.id = "model-suggestions";
                    modelInput.parentElement.appendChild(dataList);
                }
                dataList.innerHTML = '';
                models.forEach(model => {
                    let option = document.createElement('option');
                    option.value = model;
                    dataList.appendChild(option);
                });
            } else {
                modelInput.disabled = true;
                modelInput.setAttribute("list", "");
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            modelInput.disabled = true;
        }
    } else {
        // If no brand is selected, disable the model input
        modelInput.disabled = true;
        modelInput.setAttribute("list", "");
    }
}

// Add event listener for brand input
document.getElementById('brand').addEventListener('input', updateModelSuggestions);
