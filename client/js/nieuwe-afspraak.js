(function () {
  "use strict";

  const body = document.body;

  const stepper = document.querySelector(".stepper");
  const steps = Array.from(document.querySelectorAll(".stepper .step"));
  const panels = Array.from(document.querySelectorAll(".panel-wrap > section"));

  body.classList.add("is-entering");
  requestAnimationFrame(() => body.classList.remove("is-entering"));

  function getPanel(stepNumber) {
    return (
      document.querySelector(`.panel-wrap [data-step="${stepNumber}"]`) ||
      document.querySelector(`.panel-wrap [data-panel="${stepNumber}"]`)
    );
  }

  function animatePanel(panel) {
    if (!panel) return;
    panel.classList.remove("is-animating");
    void panel.offsetWidth; // restart animation
    panel.classList.add("is-animating");
  }

  function setStepperState(activeStep) {
    if (stepper) {
      stepper.classList.remove("step-1", "step-2", "step-3", "step-4");
      stepper.classList.add(`step-${activeStep}`);
    }

    steps.forEach((s) => {
      const n = Number(s.dataset.step);
      s.classList.toggle("is-active", n === activeStep);
      s.classList.toggle("is-done", n < activeStep);
    });
  }

  function showStep(stepNumber, animate = true) {
    panels.forEach((p) => p.classList.remove("is-active", "is-animating"));

    const target = getPanel(stepNumber);
    if (target) {
      target.classList.add("is-active");
      if (animate) animatePanel(target);
    }

    setStepperState(stepNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showStep(1, false);

  steps.forEach((s) => {
    s.addEventListener("click", () => {
      const target = Number(s.dataset.step);
      const current = Number(
        document.querySelector(".stepper .step.is-active")?.dataset.step || 1
      );
      if (target <= current) showStep(target, true);
    });
  });

  
  document.addEventListener("click", (e) => {
    const deptBtn = e.target.closest(".js-pick-dept");
    if (deptBtn) {
      const card = deptBtn.closest(".pick-card");
      const dept = (card?.dataset.dept || "").toLowerCase();
      if (dept === "kaakchirurgie") showStep(2, true);
      return;
    }

    const docBtn = e.target.closest(".js-pick-doctor");
    if (docBtn) {
      showStep(3, true);
      return;
    }

    if (e.target.closest(".js-back")) {
      showStep(1, true);
      return;
    }

    const actionEl = e.target.closest("[data-action]");
    if (actionEl) {
      const action = actionEl.getAttribute("data-action");

      if (action === "back-to-2") {
        showStep(2, true);
        return;
      }

      if (action === "cancel") {
        const d = document.getElementById("apptDate");
        const t = document.getElementById("apptTime");
        if (d) d.value = "";
        if (t) t.value = "";
        showStep(1, true);
        return;
      }

      if (action === "confirm") {
        const d = document.getElementById("apptDate")?.value;
        const t = document.getElementById("apptTime")?.value;

        if (!d || !t) {
          alert("Vul eerst een datum en tijd in.");
          return;
        }

        showStep(4, true);
        return;
      }
    }
  });

  document.querySelectorAll("a.js-nav").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href) return;

      e.preventDefault();
      body.classList.add("is-leaving");
      setTimeout(() => (window.location.href = href), 220);
    });
  });
})();