(() => {
  "use strict";

  const doctorSelect = document.getElementById("doctorSelect");
  const dateSelect   = document.getElementById("dateSelect");
  const viewBtn      = document.getElementById("viewBtn");

  const docImg  = document.getElementById("docImg");
  const docName = document.getElementById("docName");
  const docDept = document.getElementById("docDept");

  const timesGrid = document.getElementById("timesGrid");

  const DOCTORS = {
    alexander: {
      name: "Drs. F. Alexander",
      dept: "Kaakchirurgie",
      spec: "Kaakchirurg",
      img: "/img/doctor-alexander.jpg",
    },
    velazquez: {
      name: "Drs. R. Velazquez",
      dept: "Kaakchirurgie",
      spec: "Kaakchirurg",
      img: "/img/doctor-velazquez.jpg",
    },
  };

  const DEMO_TIMES = [
    "09:00","09:30","10:00","10:30",
    "11:00","11:30","12:00","12:30",
    "14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30",
  ];

  function canViewTimes(){
    return Boolean(doctorSelect?.value) && Boolean(dateSelect?.value);
  }

  function setButtonState(){
    if (!viewBtn) return;
    viewBtn.disabled = !canViewTimes();
  }

  function renderDoctor(){
    const key = doctorSelect.value;
    const d = DOCTORS[key];

    if (!d) {
      docName.textContent = "----";
      docDept.textContent = "----";
      return;
    }

    docName.textContent = d.name;
    docDept.textContent = `${d.dept} • ${d.spec}`;
    if (docImg) docImg.src = d.img;
  }

  function renderTimes(times){
    timesGrid.innerHTML = "";
    times.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bt-time";
      btn.textContent = t;
      timesGrid.appendChild(btn);
    });
  }

  doctorSelect?.addEventListener("change", () => {
    renderDoctor();
    setButtonState();
  });

  dateSelect?.addEventListener("change", setButtonState);

  viewBtn?.addEventListener("click", () => {
  if (!canViewTimes()) return;

  renderDoctor();
  renderTimes(DEMO_TIMES);

  const scrollBox = document.getElementById("timesScroll");
  if (scrollBox) scrollBox.scrollTop = 0;

  const card = document.querySelector(".bt-card");
  if (card) {
    card.classList.remove("is-animating");
    void card.offsetWidth;
    card.classList.add("is-animating");
  }
});

  renderDoctor();
  setButtonState();
})();