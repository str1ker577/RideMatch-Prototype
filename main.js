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



////////////////////
//Filter Functions//
////////////////////

fetchData();

async function fetchData() {
    
    try {
        const response = await fetch('http://127.0.0.1:5000/get_cars?brand=Toyota&min_hp=100&max_hp=200');

        if(!response.ok){
            throw new Error("Could not fetch resource")
        }     
        
        const data = await response.json();
        console.log(data);

    }

    catch(error){
        console.error(error);
    }
}


document.querySelector('.filter-btn').addEventListener('click', () => {
    const brand = document.getElementById('brand').value;
    const driveTrain = document.getElementById('drive-train').value;
    const minHp = document.getElementById('horsepower').value;
    const minCargo = document.getElementById('cargo-space').value;
    const minPrice = document.getElementById('price').value;

    const url = new URL("http://127.0.0.1:5000/get_cars");
    url.searchParams.append("brand", brand);
    url.searchParams.append("drive_train", driveTrain);
    url.searchParams.append("min_hp", minHp);
    url.searchParams.append("min_cargo", minCargo);
    url.searchParams.append("min_price", minPrice);

    fetch(url)
        .then(response => response.json())
        .then(data => displayFilteredCars(data))
        .catch(error => console.error('Error:', error));
});

function displayFilteredCars(data) {
    const resultFrame = document.createElement('div');
    resultFrame.classList.add('result-frame');

    if (data.length === 0) {
        resultFrame.innerHTML = "<p>No matching cars found.</p>";
    } else {
        data.forEach(car => {
            const carCard = document.createElement('div');
            carCard.classList.add('car-card');
            carCard.innerHTML = `
                <h3>${car.Brand} ${car.Model}</h3>
                <p>Horsepower: ${car.Horsepower} hp</p>
                <p>Price: ₱${car.Price.toLocaleString()}</p>
                <p>Cargo Space: ${car.Cargo_space} L</p>
            `;
            resultFrame.appendChild(carCard);
        });
    }

    document.body.appendChild(resultFrame);
}
