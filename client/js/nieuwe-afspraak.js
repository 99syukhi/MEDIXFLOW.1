(function () {
  "use strict";

  const API_URL = 'http://localhost:5000/api/user';
  let selectedDept = "";
  let selectedDoctor = "";

  const stepper = document.querySelector(".stepper");
  const steps = Array.from(document.querySelectorAll(".stepper .step"));
  const panels = Array.from(document.querySelectorAll(".panel-wrap > section"));
  const dateInput = document.getElementById("apptDate");
  const timeSelect = document.getElementById("apptTime");

  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  async function fillTimeSlots() {
    if (!timeSelect || !dateInput.value || !selectedDoctor) {
        console.warn("Kan tijdstippen niet laden: ontbrekende gegevens.");
        return;
    }

    const token = sessionStorage.getItem('token');
    const dateVal = dateInput.value;

    try {
        timeSelect.innerHTML = '<option value="" disabled selected>Laden...</option>';

        const res = await fetch(`${API_URL}/appointments/check-availability?doctor=${encodeURIComponent(selectedDoctor)}&date=${dateVal}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!res.ok) throw new Error("Kon beschikbaarheid niet laden");
        
        const occupiedTimes = await res.json(); 

        timeSelect.innerHTML = '<option value="" disabled selected>Kies een tijdstip...</option>';

        const startMin = 8 * 60 + 30; 
        const endMin = 13 * 60 + 30;  
        const interval = 10;

        for (let minutes = startMin; minutes <= endMin; minutes += interval) {
            const h = Math.floor(minutes / 60).toString().padStart(2, '0');
            const m = (minutes % 60).toString().padStart(2, '0');
            const timeString = `${h}:${m}`;

            const isOccupied = occupiedTimes.includes(timeString);
            const option = document.createElement('option');
            option.value = timeString;
            
            if (isOccupied) {
                option.textContent = `${timeString} uur (Bezet)`;
                option.disabled = true;
                option.className = "time-occupied"; 
            } else {
                option.textContent = `${timeString} uur`;
            }
            timeSelect.appendChild(option);
        }
    } catch (err) {
        console.error("Fetch error:", err);
        timeSelect.innerHTML = '<option value="" disabled selected>Fout bij laden</option>';
    }
}

  function showStep(stepNumber, animate = true) {
    panels.forEach((p) => p.classList.remove("is-active", "is-animating"));
    const target = getPanel(stepNumber);
    if (target) {
      target.classList.add("is-active");
      if (animate) {
        target.classList.remove("is-animating");
        void target.offsetWidth; 
        target.classList.add("is-animating");
      }
    }
    setStepperState(stepNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getPanel(stepNumber) {
    return document.querySelector(`.panel-wrap [data-step="${stepNumber}"]`) ||
           document.querySelector(`.panel-wrap [data-panel="${stepNumber}"]`);
  }

  function setStepperState(activeStep) {
    if (stepper) {
      stepper.className = `stepper step-${activeStep}`;
    }
    steps.forEach((s) => {
      const n = Number(s.dataset.step);
      s.classList.toggle("is-active", n === activeStep);
      s.classList.toggle("is-done", n < activeStep);
    });
  }

  if (dateInput) {
    dateInput.addEventListener("change", function() {
      const date = new Date(this.value);
      const day = date.getUTCDay();
      
      if (day === 0 || day === 6) {
        alert("Het ziekenhuis is in het weekend gesloten. Kies a.u.b. een doordeweekse dag.");
        this.value = "";
        timeSelect.innerHTML = '<option value="" disabled selected>Kies eerst een datum...</option>';
      } else if (selectedDoctor) {
        fillTimeSlots();
      }
    });
  }

  document.addEventListener("click", async (e) => {
    const deptBtn = e.target.closest(".js-pick-dept");
    if (deptBtn) {
      const card = deptBtn.closest(".pick-card");
      selectedDept = card?.dataset.dept || "Kaakchirurgie";
      showStep(2);
      return;
    }

    const docBtn = e.target.closest(".js-pick-doctor");
    if (docBtn) {
      const card = docBtn.closest(".pick-card");
      selectedDoctor = card?.querySelector('h4')?.innerText || "Onbekende Arts";
      fillTimeSlots(); 
      showStep(3);
      return;
    }

    if (e.target.closest(".js-back") || e.target.closest("[data-action='back-to-2']")) {
      const activeStep = document.querySelector(".step.is-active");
      const currentN = Number(activeStep?.dataset.step || 3);
      showStep(currentN - 1);
      return;
    }

    const actionEl = e.target.closest("[data-action]");
    if (actionEl) {
      const action = actionEl.getAttribute("data-action");

      if (action === "cancel") {
        if (dateInput) dateInput.value = "";
        if (timeSelect) timeSelect.selectedIndex = 0;
        showStep(1);
      }

      if (action === "confirm") {
        const dateVal = dateInput?.value;
        const timeVal = timeSelect?.value;

        if (!dateVal || !timeVal) {
          alert("Selecteer een datum en tijdstip.");
          return;
        }

        try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(`${API_URL}/create-appointment`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              department: selectedDept,
              doctor: selectedDoctor,
              date: dateVal,
              time: timeVal
            })
          });

          const data = await response.json();
          if (response.ok) {
            showStep(4);
          } else {
            alert(data.error || "Er ging iets mis bij het inplannen.");
          }
        } catch (err) {
          alert("Geen verbinding met de server.");
        }
      }
    }
  });

  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }

  showStep(1, false);

})();