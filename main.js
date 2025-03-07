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
    const brand = document.getElementById("brand").value.trim();
    const bodyType = document.getElementById("body-type").value.trim();
    const driveTrain = document.getElementById("drive-train").value.trim();
    const transmission = document.getElementById("transmission").value.trim();
    const fuelType = document.getElementById("fuel-type").value.trim(); 
    const minHp = parseFloat(document.getElementById("horsepower").value) || 50;
    const minCargo = parseFloat(document.getElementById("cargo-space").value) || 100;
    const minPrice = parseFloat(document.getElementById("price").value) || 5000;
    const minGroundClearance = parseFloat(document.getElementById("ground-clearance").value) || 13.3;
    const seating = parseInt(document.getElementById("seating").value) || 0;

    console.log("🚀 Filters Applied:");
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
    const url = new URL("http://127.0.0.1:5000/get_cars");

    // Render API Link //
    //const url = new URL("https://ridematch-tsv7.onrender.com/get_cars");//

    
    if (brand) url.searchParams.append("brand", brand);
    if (bodyType) url.searchParams.append("body_type", bodyType);
    if (driveTrain) url.searchParams.append("drive_train", driveTrain);
    if (transmission) url.searchParams.append("transmission", transmission);
    if (fuelType) url.searchParams.append("fuel_type", fuelType); 
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
        displayFilteredCars(data);
    } catch (error) {
        console.error("🚨 Error fetching data:", error);
    }
}

function displayFilteredCars(data) {
    console.log("📊 Displaying cars:", data);

    const resultsFrame = document.getElementById("results-frame");
    const resultsBody = document.getElementById("results-body");

    if (!resultsFrame || !resultsBody) {
        console.error("❌ Results elements not found!"); 
        return;
    }

    resultsFrame.style.display = "block";  
    setTimeout(() => resultsFrame.classList.add("active"), 50)

    resultsBody.innerHTML = "";

    if (data.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="14" style="text-align: center;">No matching cars found.</td></tr>`;
        console.warn("⚠️ No cars found for given filters.");
        return;
    }

    let likedCars = JSON.parse(localStorage.getItem("likedCars")) || [];

    data.forEach(car => {
        const carId = `${car.Brand}-${car.Model}`;
        const isLiked = likedCars.includes(carId);

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
            <div class="heart-container" onclick="toggleLike(this.querySelector('i'), '${car.Model}')">
                <i class="fa-regular fa-heart like-icon"></i>
            </div>
        </td>
    `;
    

        resultsBody.appendChild(row);
    });

    setupLikeButtons();
    console.log("✅ Table updated successfully!");
}



function setupLikeButtons() {
    document.querySelectorAll(".heart-icon").forEach(icon => {
        icon.addEventListener("click", function () {
            const carId = this.dataset.id; 
            toggleLike(this, carId);
        });
    });
}

function toggleLike(icon, carId) {
    let likedCars = JSON.parse(localStorage.getItem("likedCars")) || [];

    if (likedCars.includes(carId)) {
        likedCars = likedCars.filter(id => id !== carId);
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
        icon.style.color = "#b49b66"; // Default color
    } else {
        likedCars.push(carId);
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        icon.style.color = "red"; // Change inner color to red
    }

    localStorage.setItem("likedCars", JSON.stringify(likedCars));
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

    filterButton.addEventListener("click", function () {
        const filtersApplied = true; // Replace with actual filter check logic

        if (filtersApplied) {
            resultsFrame.classList.add("active"); // Show the results frame
        }
    });
});

//////////////////////////
// Heart/Saved Function //
//////////////////////////





