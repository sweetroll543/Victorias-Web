"use strict";
// EDITAR: tiempo entre fotografías en milisegundos (5000 = 5 segundos).
const TIEMPO_SLIDER = 5000;
document.documentElement.classList.add("con-js");
const menu = document.querySelector("#menu");
const botonMenu = document.querySelector(".boton-menu");
function cerrarMenu() {
  menu.classList.remove("abierto");
  botonMenu.setAttribute("aria-expanded", "false");
}
botonMenu.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  botonMenu.setAttribute("aria-expanded", String(abierto));
});
menu.querySelectorAll("a").forEach(enlace => enlace.addEventListener("click", cerrarMenu));
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarMenu(); });
const slider = document.querySelector(".slider");
const slides = [...document.querySelectorAll(".diapositiva")];
const puntos = [...document.querySelectorAll(".indicador")];
const pausa = document.querySelector("#pausa");
const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
let actual = 0;
let pausado = movimientoReducido.matches;
let temporizador;
let encima = false;
let enfocado = false;
function mostrar(indice, anunciar = false) {
  actual = (indice + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    slide.hidden = i !== actual;
    slide.classList.toggle("activa", i === actual);
  });
  puntos.forEach((punto, i) => {
    punto.classList.toggle("seleccionado", i === actual);
    if (i === actual) punto.setAttribute("aria-current", "true");
    else punto.removeAttribute("aria-current");
  });
  if (anunciar) document.querySelector("#estado-slider").textContent = `Fotografía ${actual + 1} de ${slides.length}`;
}
function programar() {
  clearInterval(temporizador);
  pausa.textContent = pausado ? "Reproducir" : "Pausar";
  pausa.setAttribute("aria-label", pausado ? "Reproducir cambio automático" : "Pausar cambio automático");
  if (!pausado && !encima && !enfocado && !document.hidden) {
    temporizador = setInterval(() => mostrar(actual + 1), TIEMPO_SLIDER);
  }
}
function cambiar(indice) { mostrar(indice, true); programar(); }
document.querySelector("#anterior").addEventListener("click", () => cambiar(actual - 1));
document.querySelector("#siguiente").addEventListener("click", () => cambiar(actual + 1));
puntos.forEach((punto, i) => punto.addEventListener("click", () => cambiar(i)));
pausa.addEventListener("click", () => { pausado = !pausado; programar(); });
slider.addEventListener("mouseenter", () => { encima = true; programar(); });
slider.addEventListener("mouseleave", () => { encima = false; programar(); });
slider.addEventListener("focusin", () => { enfocado = true; programar(); });
slider.addEventListener("focusout", e => {
  enfocado = slider.contains(e.relatedTarget);
  programar();
});
slider.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault(); cambiar(actual + (e.key === "ArrowLeft" ? -1 : 1));
  }
});
// Deslizar con el dedo en celulares.
let inicioX = null;
let inicioY = null;
slider.addEventListener("touchstart", e => {
  inicioX = e.touches[0].clientX; inicioY = e.touches[0].clientY;
}, { passive:true });
slider.addEventListener("touchend", e => {
  if (inicioX === null) return;
  const dx = e.changedTouches[0].clientX - inicioX;
  const dy = e.changedTouches[0].clientY - inicioY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) cambiar(actual + (dx < 0 ? 1 : -1));
  inicioX = null;
}, { passive:true });
document.addEventListener("visibilitychange", programar);
movimientoReducido.addEventListener("change", e => { if (e.matches) pausado = true; programar(); });
document.querySelector("#anio").textContent = new Date().getFullYear();
mostrar(0);
programar();
