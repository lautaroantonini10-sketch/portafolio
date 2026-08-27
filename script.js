const btnMenuPortafolio = document.querySelector("#btn-menu-portafolio");
const navLinksPortafolio = document.querySelector("#nav-links-portafolio");

btnMenuPortafolio?.addEventListener("click", function() {
    navLinksPortafolio.classList.toggle("mostrar-movil");
});

document.querySelectorAll(".nav-links a").forEach(function(link) {
    link.addEventListener("click", function() {
        navLinksPortafolio.classList.remove("mostrar-movil");
    });
});