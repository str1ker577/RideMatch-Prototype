//////////////////////
//Side Menu Function//
//////////////////////


const baseUrl = `http://127.0.0.1:5000`; // Base URL for API requests

//const baseUrl = "https://a7cbb3da-2928-4d18-ba75-ea41ce8ad0c5-00-g8eiilou0duk.sisko.replit.dev"; // Base URL for API requests

// Get elements for toggling sidebar and menu button

const menuButton = document.getElementById('menu-button');
const closeButton = document.getElementById('close-button');
const sidebar = document.getElementById('sidebar');

menuButton.addEventListener('click', () => {
    sidebar.classList.add('open');
    menuButton.style.display = 'none'; 
    closeButton.style.display = 'block';
});

// Close the sidebar and switch back the icons when close button is clicked
closeButton.addEventListener('click', () => {
    sidebar.classList.remove('open');
    menuButton.style.display = 'block'; 
    closeButton.style.display = 'none';
});



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

function handleLogin(event) {
    event.preventDefault(); // Prevent the default form submission
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    // Perform AJAX request to login
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'email': email,
            'password': password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.status) {
            document.querySelector('.success-message').textContent = '';
            document.querySelector('.error-message').textContent = data.message;
        } else {
            document.querySelector('.welcome-title').textContent = data.message + data.email + "!";
            document.querySelector('.error-message12').textContent = '';
            togglePopup('login-popup'); // Close login popup
            sidebar.classList.remove('open');
            menuButton.style.display = 'block'; 
            closeButton.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function handleSignup(event) {
    event.preventDefault(); // Prevent the default form submission
    const email = document.querySelector('input[name="email_signup"]').value;
    const password = document.querySelector('input[name="password_signup"]').value;
    
    // Perform AJAX request to signup
    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'email': email,
            'password': password
        })
    })
    .then(response => {
      if (!response.ok) {
            return response.json().then(data => {
                // Display error message
                console.log(data);
                document.querySelector('.success-message').textContent = '';
                document.querySelector('.error-message12').textContent = data.message;
            });
        }
        // Handle successful signup
        document.querySelector('.success-message').textContent = "Signup successful! Please log in.";
        document.querySelector('.error-message12').textContent = '';
        document.querySelector('.error-message').textContent = '';
        togglePopup('login-popup'); // Close signup popup and open login popup
        togglePopup('signup-popup'); // Close signup popup

    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function parseCSV(data) {
    const lines = data.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentLine[j].trim();
        }
        result.push(obj);
    }
    return result;
}


document.addEventListener("DOMContentLoaded", function () {
    const filterButton = document.getElementById("filter-btn");

    if (!filterButton) {
        console.error("🚨 Error: Filter button not found! Check your HTML.");
        return; // Stop execution if button is missing
    }

});

// ✅ New function to update slider values dynamically
function updateSliderValue(id, unit = "", isCurrency = false) {
    const slider = document.getElementById(id);
    const display = document.getElementById(id + "-value");

    if (slider && display) {
        // Display initial value
        if (id === "seating") {
            display.textContent = slider.value + " seats"; // ✅ Always show 'seats'
        } else {
            display.textContent = isCurrency
                ? "₱" + parseInt(slider.value, 10).toLocaleString()
                : slider.value + " " + unit;
        }

        // Update value when slider moves
        slider.addEventListener("input", function () {
            if (id === "seating") {
                display.textContent = slider.value + " seats"; // ✅ Ensures "X seats" is always shown
            } else {
                const value = parseInt(slider.value, 10) || 0; 
                display.textContent = isCurrency
                    ? "₱" + value.toLocaleString()
                    : value + " " + unit;
            }
        });
    }
}


async function applyFilters() {

    console.log("apply filters clicked");

    const brand = document.getElementById("brand").value.trim().toLowerCase();
    const bodyType = document.getElementById("body-type").value.trim().toLowerCase();
    const driveTrain = document.getElementById("drive-train").value.trim().toLowerCase();
    const transmission = document.getElementById("transmission").value.trim().toLowerCase();
    const fuelType = document.getElementById("fuel-type").value.trim().toLowerCase(); 
    const minHp = parseFloat(document.getElementById("horsepower").value) || 50;
    const minCargo = parseFloat(document.getElementById("cargo-space").value) || 100;
    const minPrice = parseFloat(document.getElementById("price").value) || 5000;
    const minGroundClearance = parseFloat(document.getElementById("ground-clearance").value) || 13.3;
    const seating = parseInt(document.getElementById("seating").value) || 0;

    console.log("🚀 Filters Applied:");
    console.log("Starting applyFilters function..."); // Added debugging log
    console.log("Brand:", brand);
    console.log("Body Type:", bodyType);
    console.log("Drive Train:", driveTrain);
    console.log("Transmission:", transmission);
    console.log("Fuel Type:", fuelType);
    console.log("Min HP:", minHp);
    console.log("Min Cargo Space:", minCargo);
    console.log("Min Price:", minPrice);
    console.log("Min Ground Clearance:", minGroundClearance);
    console.log("Min Seating Capacity:", seating);
    console.log("Brand:", brand);
    console.log("Body Type:", bodyType);
    console.log("Drive Train:", driveTrain);
    console.log("Transmission:", transmission);
    console.log("Fuel Type:", fuelType);
    console.log("Min HP:", minHp);
    console.log("Min Cargo Space:", minCargo);
    console.log("Min Price:", minPrice);
    console.log("Min Ground Clearance:", minGroundClearance);
    console.log("Min Seating Capacity:", seating);

    // Render API Link //
    const url = new URL(`${baseUrl}/get_cars`);//
    
    if (brand) url.searchParams.append("brand", brand.charAt(0).toUpperCase() + brand.slice(1)); // Append brand filter if specified

    if (bodyType) url.searchParams.append("body_type", bodyType.charAt(0).toUpperCase() + bodyType.slice(1)); // Append body type filter if specified

    if (driveTrain) url.searchParams.append("drive_train", driveTrain.charAt(0).toUpperCase() + driveTrain.slice(1)); // Append drive train filter if specified

    if (transmission) url.searchParams.append("transmission", transmission.charAt(0).toUpperCase() + transmission.slice(1)); // Append transmission filter if specified

    if (fuelType) url.searchParams.append("fuel_type", fuelType.charAt(0).toUpperCase() + fuelType.slice(1)); // Append fuel type filter if specified

    url.searchParams.append("min_hp", minHp);
    url.searchParams.append("min_cargo", minCargo);
    url.searchParams.append("min_price", minPrice);
    url.searchParams.append("min_ground_clearance", minGroundClearance);
    url.searchParams.append("seating", seating);


    console.log("📤 Sending request to:", url.href); // Log the request URL


    try {
    const response = await fetch(url); // Fetch data from the constructed URL

        const data = await response.json();
        console.log("📥 Received data:", data);
        if (data.length === 0) {
            console.warn("⚠️ No cars found for given filters.");
            alert("No matching cars found. Please try different filters.");
        } else {
            displayFilteredCars(data);
        }
    } catch (error) {
        console.error("🚨 Error fetching data:", error);
        alert("An error occurred while fetching data. Please try again later.");
    }
}

function displayFilteredCars(data) {
    console.log("📊 Displaying cars data:", data); // Debugging log


    const resultsFrame = document.getElementById("results-frame");
    const resultsBody = document.getElementById("car-specs");


    // ✅ Check if elements exist
    if (!resultsFrame || !resultsBody) {
        console.error("❌ Results elements not found!"); 
        return;
    }

    // ✅ Ensure the results frame is visible
    resultsFrame.style.display = "block"; // Make results frame visible

    resultsFrame.classList.add("active");

    // ✅ Clear the table body before inserting new data
    resultsBody.innerHTML = "";

    // ✅ Handle case when no results match
    if (data.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="12" style="text-align: center;">No matching cars found.</td></tr>`;
        console.warn("⚠️ No cars found for given filters.");
        return;
    }

    data.forEach(car => {

        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${car.Brand || "Unknown"}</td>
        <td>${car.Model || "Unknown"}</td>
        <td>${car.Body_Type || "N/A"}</td>
        <td>${car.Variant || "N/A"}</td>
        <td>${car.Drive_Train || "N/A"}</td>
        <td>${car.Engine || "N/A"}</td>
        <td>${car.Horsepower ? car.Horsepower + " hp" : "N/A"}</td>
        <td>${car.Transmission || "N/A"}</td>
        <td>${car.Fuel_Type || "N/A"}</td>
        <td>${car.Ground_Clearance ? car.Ground_Clearance + " cm" : "N/A"}</td>
        <td>${car.Cargo_space ? car.Cargo_space + " L" : "N/A"}</td>
        <td>${car.Seating_Capacity ? car.Seating_Capacity + " seats" : "N/A"}</td>
        <td>${car.Price ? "₱" + car.Price.toLocaleString() : "N/A"}</td>
        <td>
            <div class="heart-container">
                <i class="fa-regular fa-heart" id="like-icon" onclick="addToFave(event, '${car.Variant}')"></i>
            </div>
        </td>
    `;
        resultsBody.appendChild(row);
    });


    console.log("✅ Table updated successfully!");
}

////////////////////////////////////
//When Filter is button is Pressed//
//////////////////////////////////////


document.addEventListener("DOMContentLoaded", function () {
    const filterButton = document.getElementById("filter-btn"); 
    const resultsFrame = document.querySelector(".results-frame");

    if (!filterButton) {
        console.error("🚨 Error: Filter button not found! Check your HTML.");
        return; // Stop execution if button is missing
    }

    // Ensure sliders start at minimum values
    const priceSlider = document.getElementById("price");
    const horsepowerSlider = document.getElementById("horsepower");
    const seatingSlider = document.getElementById("seating");

    priceSlider.value = priceSlider.min;
    horsepowerSlider.value = horsepowerSlider.min;
    seatingSlider.value = "0";

    // Update displayed values to match the min values
    updateSliderValue("price", "₱", true);
    updateSliderValue("horsepower", "HP", false);
    updateSliderValue("seating", "seats", false);

});


//////////////////////
//COMPARE Function////
//////////////////////

async function compareCars() {
    const selectedVariant = document.getElementById('variant').value; // Get value from variant dropdown
    if (!selectedVariant) {
        console.warn("No variant selected.");
        return; // Exit if no variant is selected
    }

    console.log("Fetching specs for variant:", selectedVariant);
    const response = await fetch(`${baseUrl}/get_specs?variant=${selectedVariant}`);

    const specs = await response.json();

    if (Object.keys(specs).length === 0) {
        alert('No specifications found for this variant.');
        return;
    }

    const container = document.getElementById('comparison-container');

    // If this is the first car, create the specification title column
    let titleColumn = document.getElementById('title-column');
    if (!titleColumn) {
        titleColumn = document.createElement('div');
        titleColumn.id = 'title-column';
        titleColumn.classList.add('column', 'title-column');

        // Removed the empty title div to ensure proper alignment


        for (const key of Object.keys(specs)) {
            const titleDiv = document.createElement('div');
            titleDiv.classList.add('spec-title');
            titleDiv.textContent = key;
            titleColumn.appendChild(titleDiv);
        }

        container.appendChild(titleColumn);
    }

    // Check if this car was already added to avoid duplicates
    if (document.getElementById(`car-${selectedVariant}`)) {
        alert(`${selectedVariant} is already in the comparison.`);
        return;
    }

    // Create a new column for this car
    const carColumn = document.createElement('div');
    carColumn.id = `car-${selectedVariant}`;
    carColumn.classList.add('column');

    // Add car name at the top
    const carTitle = document.createElement('div');
    carTitle.classList.add('car-title');
    carTitle.textContent = selectedVariant;
    carColumn.appendChild(carTitle);

    // Add specs for this car
    Object.values(specs).forEach(value => {
        const specDiv = document.createElement('div');
        specDiv.id = 'specs_column';
        specDiv.classList.add('spec-value');
        specDiv.textContent = value;
        carColumn.appendChild(specDiv);
    });

    // Append the new car column next to existing ones
    container.appendChild(carColumn);
}


async function populateModels() {
    const selectedBrand = document.getElementById('brand').value;
    if (!selectedBrand) return; // Exit if no brand is selected

    const response = await fetch(`${baseUrl}/get_models?brand=${selectedBrand}`);

    const models = await response.json();
    const modelSelect = document.getElementById('model');
    modelSelect.innerHTML = '<option value="">Select Model</option>'; // Reset models

    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });
}

async function populateVariants() {
    const selectedModel = document.getElementById('model').value;
    if (!selectedModel) return; // Exit if no model is selected

    const response = await fetch(`${baseUrl}/get_variants?model=${selectedModel}`);

    const variants = await response.json();
    
    const variantSelect = document.getElementById('variant');
    variantSelect.innerHTML = '<option value="">Select Variant</option>'; // Reset models

    variants.forEach(variant => {
        const option = document.createElement('option');
        option.value = variant;
        option.textContent = variant;
        variantSelect.appendChild(option);
    });
}


///////////////////////
//FAVOURITES Function//
///////////////////////
async function addToFave(event, variant) {

    const isLiked = event.target.classList.contains('fa-solid');
    const likedStatus = !isLiked;

    const response = await fetch(`${baseUrl}/toggle-fave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant: variant, liked: likedStatus })
    });
    
    const data = await response.json();
    console.log(data);
    if (data.liked) {
        // Change to solid icon
        event.target.classList.toggle('fa-solid');
    } else {
        // Change to outline icon
        event.target.classList.toggle('fa-solid');
    }

}
async function loadFavorites() {
    const response = await fetch(`${baseUrl}/get-faves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    const favorites = await response.json();
    const favoritesList = document.getElementById("favorites-items");
    favoritesList.innerHTML = ""; // Clear existing items

    for (const car of favorites) {
        const variantResponse = await fetch(`${baseUrl}/get_variants?model=${car.variant}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const variantData = await variantResponse.json();

        const listItem = document.createElement("li");
        listItem.textContent = `${variantData.Brand} ${variantData.Model} - ${variantData.Price}`; // Display full details

        favoritesList.appendChild(listItem);
    }
}
