(() => {
  "use strict";

  const doctorSelect = document.getElementById("doctorSelect");
  const dateSelect   = document.getElementById("dateSelect");
  const viewBtn      = document.getElementById("viewBtn");
  const docImg       = document.getElementById("docImg");
  const docName      = document.getElementById("docName");
  const docDept      = document.getElementById("docDept");
  const timesGrid    = document.getElementById("timesGrid");

  const API_URL = 'http://localhost:5000/api/user';

  const DOCTORS = {
    alexander: {
      name: "Drs. F. Alexander",
      dept: "Kaakchirurgie",
      spec: "Kaakchirurg",
      img: "img/doctor-alexander.jpg",
    },
    velazquez: {
      name: "Drs. R. Velazquez",
      dept: "Kaakchirurgie",
      spec: "Kaakchirurg",
      img: "img/doctor-velazquez.jpg",
    },
  };

  function getPossibleTimeSlots() {
    const slots = [];
    const startMin = 8 * 60 + 30; 
    const endMin = 13 * 60 + 30;   
    const interval = 10;

    for (let minutes = startMin; minutes <= endMin; minutes += interval) {
      const h = Math.floor(minutes / 60).toString().padStart(2, '0');
      const m = (minutes % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
    return slots;
  }

  const ALL_POSSIBLE_TIMES = getPossibleTimeSlots();

  function canViewTimes() {
    return Boolean(doctorSelect?.value) && Boolean(dateSelect?.value);
  }

  function setButtonState() {
    if (viewBtn) viewBtn.disabled = !canViewTimes();
  }

  function renderDoctor() {
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

function renderTimes(bookedTimes, doctorObj, selectedDate) {
    timesGrid.innerHTML = ""; 
    
    ALL_POSSIBLE_TIMES.forEach((t) => {
        const isBooked = bookedTimes.includes(t); 
        
        const btn = document.createElement("button");
        btn.type = "button";

        btn.className = isBooked ? "bt-time is-booked" : "bt-time";
        btn.textContent = t;
        
        if (isBooked) {
            btn.disabled = true;
        } else {
            btn.addEventListener("click", () => handleBooking(doctorObj, selectedDate, t));
        }
        
        timesGrid.appendChild(btn);
    });
}

  async function handleBooking(doctor, date, time) {
    if (!confirm(`Bevestig afspraak bij ${doctor.name} op ${date} om ${time}?`)) return;

    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/create-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor: doctor.name,
          department: doctor.dept,
          date: date,
          time: time
        })
      });

      if (res.ok) {
        alert("Afspraak succesvol gepland!");
        window.location.href = "mijn-afspraken.html";
      } else {
        const err = await res.json();
        alert("Fout: " + (err.error || "Kon afspraak niet boeken"));
      }
    } catch (e) {
      alert("Serverfout bij het boeken.");
    }
  }

  doctorSelect?.addEventListener("change", () => {
    renderDoctor();
    setButtonState();
  });

  dateSelect?.addEventListener("change", setButtonState);

  viewBtn?.addEventListener("click", async () => {
    if (!canViewTimes()) return;

    const key = doctorSelect.value;
    const doctor = DOCTORS[key];
    const date = dateSelect.value;
    const token = sessionStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/appointments/check-availability?doctor=${encodeURIComponent(doctor.name)}&date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Beschikbaarheid ophalen mislukt");

      const booked = await res.json(); 

      renderTimes(booked, doctor, date);
    } catch (e) {
      console.error("Fout:", e);
      alert("Geen verbinding met de server of fout bij laden tijden.");
      renderTimes([], doctor, date);
    }

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