(function () {
  "use strict";

  const body = document.body;
  
  body.classList.add("is-entering");
  requestAnimationFrame(() => {
    body.classList.remove("is-entering");
  });
 
  const cards = document.querySelectorAll(".card");
  window.addEventListener("load", () => {
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add("is-visible"), 80 * i);
    });
  });

  function navigateWithFade(href) {
    if (!href) return;

    body.classList.add("is-leaving");

    setTimeout(() => {
      window.location.href = href;
    }, 220);
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");

    if (!href || href.startsWith("http") || href.startsWith("#")) return;

    e.preventDefault();
    navigateWithFade(href);
  });

  
  const buttons = document.querySelectorAll("button.card-btn, .logout-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("mousedown", () => {
      btn.style.transform = "translateY(1px)";
    });
    btn.addEventListener("mouseup", () => {
      btn.style.transform = "";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
})();