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
        const response = await fetch("http://127.0.0.1:5000/get_cars");

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