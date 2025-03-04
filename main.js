
const replitUrl = 'https://your-replit-url.onrender.com'; // REPLIT URL

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


const welcomeMessageDiv = document.getElementById('welcome-message');


// Handle Signup Form Submission
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

    filterButton.addEventListener("click", function () {
        applyFilters();
    });
});

async function applyFilters() {
    const brand = document.getElementById("brand").value.trim();
    const driveTrain = document.getElementById("drive-train").value.trim();
    const transmission = document.getElementById("transmission").value.trim();
    const minHp = parseFloat(document.getElementById("horsepower").value) || 50;
    const minCargo = parseFloat(document.getElementById("cargo-space").value) || 150;
    const minPrice = parseFloat(document.getElementById("price").value) || 5000;

    console.log("🚀 Filters Applied:");
    console.log("Brand:", brand);
    console.log("Drive Train:", driveTrain);
    console.log("Transmission:", transmission);
    console.log("Min HP:", minHp);
    console.log("Min Cargo Space:", minCargo);
    console.log("Min Price:", minPrice);

    // Construct API URL

    // Local API Link //
    //const filterUrl = new URL("http://127.0.0.1:5000/get_cars");

    // Render API Link //
    const filterUrl = new URL(`${replitUrl}/get_cars`);

    
    if (brand) filterUrl.searchParams.append("brand", brand);
    if (driveTrain) filterUrl.searchParams.append("drive_train", driveTrain);
    if (transmission) filterUrl.searchParams.append("transmission", transmission);
    filterUrl.searchParams.append("min_hp", minHp);
    filterUrl.searchParams.append("min_cargo", minCargo);
    filterUrl.searchParams.append("min_price", minPrice);

    console.log("📤 Sending request to:", filterUrl.href);

    try {
        const response = await fetch(filterUrl);
        const data = await response.json();
        console.log("📥 Received data:", data);
        displayFilteredCars(data);
    } catch (error) {
        console.error("🚨 Error fetching data:", error);
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
            <td>${car.Ground_Clearance ? car.Ground_Clearance + " cm" : "N/A"}</td>
            <td>${car.Cargo_space ? car.Cargo_space + " L" : "N/A"}</td>
            <td>${car.Seating_Capacity && car.Seating_Capacity !== "undefined" ? car.Seating_Capacity : "N/A"}</td>
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

    priceSlider.value = priceSlider.min; // Set price slider to ₱500,000
    horsepowerSlider.value = horsepowerSlider.min; // Set horsepower slider to 50 HP

    // Update displayed values to match the min values
    updateSliderValue("price", "₱", true);
    updateSliderValue("horsepower", "HP", false);

    filterButton.addEventListener("click", function () {
        const filtersApplied = true; // Replace with actual filter check logic

        if (filtersApplied) {
            resultsFrame.classList.add("active"); // Show the results frame
        }
    });
});

function updateSliderValue(id, unit, isPrice = false) {
    let value = document.getElementById(id).value;

    // Format price with commas and place the unit on the left
    if (isPrice) {
        value = "₱" + parseInt(value).toLocaleString();
    } else {
        value = parseInt(value).toLocaleString() + " " + unit;
    }

    document.getElementById(id + "-value").textContent = value;
}

// Ensure all sliders display correct formatting when the page loads
document.addEventListener("DOMContentLoaded", function() {
    updateSliderValue('price', '₱', true);
    updateSliderValue('horsepower', 'HP', false);
});






