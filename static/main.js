import { getAuth } from "firebase/auth";

const auth = getAuth();

//////////////////////
//Side Menu Function//
//////////////////////


// Get elements for toggling sidebar and menu button
const menuButton = document.getElementById('menu-button');
const closeButton = document.getElementById('close-button');
const sidebar = document.getElementById('sidebar');

// Toggle the sidebar visibility and menu button icon
menuButton.addEventListener('click', () => {
    sidebar.classList.add('open');
    menuButton.style.display = 'none'; 
    closeButton.style.display = 'block';

// Close the sidebar and switch back the icons when close button is clicked
closeButton.addEventListener('click', () => {
    sidebar.classList.remove('open');
    menuButton.style.display = 'block'; 
    closeButton.style.display = 'none';
    });
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


const welcomeMessageDiv = document.getElementById('welcome-message');

//////////////////////
//COMPARE Function////
//////////////////////

async function compareCars() {
    const car1 = document.getElementById('variant').value; // Updated to get value from variant dropdown
    const car2 = document.getElementById('variant').value; // Updated to get value from variant dropdown


    // Fetch car data from car_data.csv (assuming it's accessible via an API or static file)
    fetch('./car_data.csv') // Update this path as necessary

        .then(response => response.text())
        .then(data => {
            const cars = parseCSV(data); // Function to parse CSV data
            const car1Data = cars.find(car => car.Variant === car1);
            const car2Data = cars.find(car => car.Variant === car2);


            // Display comparison results
            const resultsDiv = document.getElementById('comparison-results');
            resultsDiv.innerHTML = `
                <h3>Comparison Results</h3>
                <p><strong>${car1Data.Brand} ${car1Data.Model}</strong>: ${JSON.stringify(car1Data)}</p>
                <p><strong>${car2Data.Brand} ${car2Data.Model}</strong>: ${JSON.stringify(car2Data)}</p>

            `;
        })
        .catch(error => {
            console.error('Error fetching car data:', error);
        });
}

async function populateBrands() {
    const response = await fetch('./car_data.csv');
    const data = await response.text();
    const cars = parseCSV(data);
    const brandSelect = document.getElementById('brand');

    const brands = [...new Set(cars.map(car => car.Brand))];
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
}

async function populateModels() {
    const selectedBrand = document.getElementById('brand').value;
    const response = await fetch('./car_data.csv');
    const data = await response.text();
    const cars = parseCSV(data);
    const modelSelect = document.getElementById('model');
    modelSelect.innerHTML = '<option value="">Select Model</option>'; // Reset models

    const models = [...new Set(cars.filter(car => car.Brand === selectedBrand).map(car => car.Model))];
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });
}

async function populateVariants() {
    const selectedModel = document.getElementById('model').value;
    const response = await fetch('./car_data.csv');
    const data = await response.text();
    const cars = parseCSV(data);
    const variantSelect = document.getElementById('variant');
    variantSelect.innerHTML = '<option value="">Select Variant</option>'; // Reset variants

    const variants = [...new Set(cars.filter(car => car.Model === selectedModel).map(car => car.Variant))];
    variants.forEach(variant => {
        const option = document.createElement('option');
        option.value = variant;
        option.textContent = variant;
        variantSelect.appendChild(option);
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


document.getElementById('signupForm').addEventListener('submit', async (e) => {    
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${replitUrl}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        });

        const result = await response.json();
        document.getElementById('message').textContent = result.message;

        if (response.status === 201) {
            
            togglePopup("login-popup");
        }
    } catch (error) {
        console.error('Error during signup:', error);
        document.getElementById('message').textContent = 'Signup failed. Please try again.';
    }
});

// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${replitUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data)
        });

        const result = await response.json();
        document.getElementById('message').textContent = result.message;

        if (response.status === 200) {
            welcomeMessageDiv.innerHTML = `
                <p>Welcome back, User! We're glad to see you again.</p>
            `;
            window.location.href = '/index.html'; // Replace with your dashboard page
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('message').textContent = 'Login failed. Please try again.';
    }
});



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

    // Construct API URL

    // Local API Link //
    //const url = new URL("https://a7cbb3da-2928-4d18-ba75-ea41ce8ad0c5-00-g8eiilou0duk.sisko.replit.dev/get_cars");

    // Render API Link //
    const url = new URL("http://127.0.0.1:5000/get_cars");//
    
    if (brand) url.searchParams.append("brand", brand.charAt(0).toUpperCase() + brand.slice(1));
    if (bodyType) url.searchParams.append("body_type", bodyType.charAt(0).toUpperCase() + bodyType.slice(1));
    if (driveTrain) url.searchParams.append("drive_train", driveTrain.charAt(0).toUpperCase() + driveTrain.slice(1));
    if (transmission) url.searchParams.append("transmission", transmission.charAt(0).toUpperCase() + transmission.slice(1));
    if (fuelType) url.searchParams.append("fuel_type", fuelType.charAt(0).toUpperCase() + fuelType.slice(1)); 
    url.searchParams.append("min_hp", minHp);
    url.searchParams.append("min_cargo", minCargo);
    url.searchParams.append("min_price", minPrice);
    url.searchParams.append("min_ground_clearance", minGroundClearance);
    url.searchParams.append("seating", seating);


    console.log("📤 Sending request to:", url.href);

    try {
        const response = await fetch(url);
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
    console.log("📊 Displaying cars:", data); // Debugging log

    const resultsFrame = document.getElementById("results-frame");
    const resultsBody = document.getElementById("results-body");

    // ✅ Check if elements exist
    if (!resultsFrame || !resultsBody) {
        console.error("❌ Results elements not found!"); 
        return;
    }

    // ✅ Ensure the results frame is visible
    resultsFrame.style.display = "block"; 
    resultsFrame.classList.add("active");

    // ✅ Clear the table body before inserting new data
    resultsBody.innerHTML = "";

    // ✅ Handle case when no results match
    if (data.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="12" style="text-align: center;">No matching cars found.</td></tr>`;
        console.warn("⚠️ No cars found for given filters.");
        return;
    }

    // ✅ Populate the table with new data
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
        `;
        resultsBody.appendChild(row);
    });

    console.log("✅ Table updated successfully!");
}

////////////////////////////////////
//When Filter is button is Pressed//
////////////////////////////////////


document.addEventListener("DOMContentLoaded", function () {
    const filterButton = document.getElementById("filter-btn"); 
    const resultsFrame = document.querySelector(".results-frame");

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

    // Removed the filter button event listener since it's handled in index.html

});


///////////////////////
//FAVOURITES Function//
///////////////////////


async function addToFave(itemId, itemName, price) {
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in first!");
      return;
    }

    const response = await fetch("http://127.0.0.1:5000/add-to-fave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          item_id: itemId,
          item_name: itemName,
          price: price,
        }),
    });

    const data = await response.json();
    console.log("Cart updated:", data.cart);
    }


async function loadFaves() {
    const user = auth.currentUser;
    if (!user) return;
    
    const response = await fetch("http://127.0.0.1:5000/get-faves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
    });
    
    const data = await response.json();
    console.log("User Favourites:", data.cart);
}
