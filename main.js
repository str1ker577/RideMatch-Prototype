let search =document.querySelector('.search-box');

document.querySelector('#search-icon').onclick = () =>{
    search.classList.toggle('active');
    user.classList.remove('active');
}

let user = document.querySelector('.user');

document.querySelector('#user-icon').onclick = () =>{
    user.classList.toggle('active');
    search.classList.remove('active');
}

const menuButton = document.getElementById('menu-button');
const closeButton = document.getElementById('close-button');
const sidebar = document.getElementById('sidebar');

menuButton.addEventListener('click', () => {
    sidebar.classList.add('open');
    menuButton.style.display = 'none';
    closeButton.style.display = 'inline-block';
});

closeButton.addEventListener('click', () => {
    sidebar.classList.remove('open');
    closeButton.style.display = 'none';
    menuButton.style.display = 'inline-block';
});