const menuButton = document.querySelector('#btn-menu-portafolio');
const menuLinks = document.querySelector('#nav-links-portafolio');
if (menuButton && menuLinks) {
    const setMenu = (open) => {
        menuLinks.classList.toggle('mostrar-movil', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    menuLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
            menuButton.focus();
        }
    });
    document.addEventListener('click', event => {
        if (!event.target.closest('.navbar')) setMenu(false);
    });
    window.matchMedia('(min-width: 769px)').addEventListener('change', () => setMenu(false));
}
