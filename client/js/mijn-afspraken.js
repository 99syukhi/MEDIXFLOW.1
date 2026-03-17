(function () {
  "use strict";

  const body = document.body;
  const tabsContainer = document.querySelector(".tabs");
  const tabs = document.querySelectorAll(".tabs .tab[data-tab]");
  const underline = document.querySelector(".tabs .tab-underline");
  const panels = document.querySelectorAll(".panel[data-panel]");
  const backLink = document.querySelector(".back-btn");

  const API_URL = 'http://localhost:5000/api/user';

  if (!tabsContainer || !tabs.length || !panels.length) return;

  body.classList.add("is-entering");
  requestAnimationFrame(() => body.classList.remove("is-entering"));

  function applyResponsiveClass() {
    const w = window.innerWidth;
    body.classList.remove("is-mobile", "is-tablet", "is-desktop");
    if (w <= 767) body.classList.add("is-mobile");
    else if (w <= 1024) body.classList.add("is-tablet");
    else body.classList.add("is-desktop");
    
    const activeTab = document.querySelector(".tabs .tab.is-active") || tabs[0];
    moveUnderlineToTab(activeTab);
  }

  window.addEventListener("resize", applyResponsiveClass);
  applyResponsiveClass();

  function moveUnderlineToTab(tabEl) {
    if (!underline || !tabEl) return;
    const tabRect = tabEl.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    const inset = 18;
    underline.style.left = `${tabRect.left - containerRect.left + inset}px`;
    underline.style.width = `${tabRect.width - inset * 2}px`;
  }

  function setActive(tabKey, animate = true) {
    tabs.forEach(t => {
      const active = t.dataset.tab === tabKey;
      t.classList.toggle("is-active", active);
      if (active) moveUnderlineToTab(t);
    });
    panels.forEach(p => p.classList.toggle("is-active", p.dataset.panel === tabKey));
  }

async function loadAppointments() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/appointments`, { 
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Laden mislukt');

        const appointments = await response.json();

        const nu = new Date();
        nu.setUTCHours(0, 0, 0, 0); 

        const toekomstig = appointments.filter(a => {
            const apptDate = new Date(a.date);
            return apptDate >= nu && a.status === "GEPLAND";
        });
        
        const eerder = appointments.filter(a => {
            const apptDate = new Date(a.date);
            return apptDate < nu || a.status === "GECANCELLED" || a.status === "VOLTOOID";
        });

        const containerToekomstig = document.querySelector('.panel[data-panel="toekomstig"]');
        const containerEerder = document.querySelector('.panel[data-panel="eerder"]');

        renderTable(containerToekomstig, toekomstig, true);
        renderTable(containerEerder, eerder, false);

    } catch (err) {
        console.error("Fout bij laden:", err);
    }
}

  function renderTable(container, data, allowCancel) {
  if (!container) return;
  if (data.length === 0) {
    container.innerHTML = `<div class="tr tr--empty"><div class="td" style="grid-column: span 4; text-align: center; padding: 40px; color: #888;">Geen afspraken gevonden.</div></div>`;
    return;
  }

  container.innerHTML = data.map(appt => `
    <div class="tr">
      <div class="td td-date" data-label="Datum">
        <span class="pill">${new Date(appt.date).toLocaleDateString('nl-NL', { timeZone: 'UTC' })}</span>
      </div>
      <div class="td td-time" data-label="Tijd">
        <span class="pill">${appt.time}</span>
      </div>
      <div class="td td-doctor" data-label="Arts">
        <div class="doctor">
          <svg class="doctor-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 32px; height: 32px; color: #4A7C59; flex-shrink: 0;">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
            <path d="m14 11-1 2-2-2"></path>
          </svg>
          <div class="doctor-info">
            <div class="doctor-name">${appt.doctor}</div>
            <div class="doctor-spec">${appt.department}</div>
          </div>
        </div>
      </div>
      <div class="td td-status" data-label="Status">
        <span class="status status--${appt.status.toLowerCase()}">${appt.status}</span>
        ${allowCancel && appt.status === 'GEPLAND' ? 
          `<button class="cancel-btn" title="Annuleer afspraak" onclick="cancelAppointment(${appt.id})">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>` : ''}
      </div>
    </div>
  `).join('');
}

  window.cancelAppointment = async function(id) {
    if (!confirm("Weet u zeker dat u deze afspraak wilt annuleren?")) return;
    
    const token = sessionStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/appointments/${id}/cancel`, {
        method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            alert("Afspraak is geannuleerd.");
            loadAppointments(); 
        } else {
            const errorData = await res.json();
            alert("Annuleren mislukt: " + (errorData.error || "Onbekende fout"));
        }
    } catch (err) {
        alert("Serverfout bij annuleren.");
    }
};

  setActive("toekomstig", false);
  loadAppointments();

  tabs.forEach(t => t.addEventListener("click", () => setActive(t.dataset.tab, true)));

  if (backLink) {
    backLink.addEventListener("click", (e) => {
      e.preventDefault();
      body.classList.add("is-leaving");
      setTimeout(() => { window.location.href = backLink.getAttribute("href"); }, 220);
    });
  }

  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.clear();
      window.location.href = 'index.html';
    });
  }
})();