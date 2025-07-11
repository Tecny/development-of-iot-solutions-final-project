(function(){
    const openButton = document.querySelector('.nav__menu');
    const menu = document.querySelector('.nav__link');
    const closeMenu = document.querySelector('.nav__close');
    const menuItems = document.querySelectorAll('.nav__link a');

    
    openButton.addEventListener('click', () => {
        menu.classList.add('nav__link--show');
    });

    
    closeMenu.addEventListener('click', () => {
        menu.classList.remove('nav__link--show');
    });

    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menu.classList.remove('nav__link--show');
        });
    });
})();
