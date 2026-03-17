let statsChart; 
let allAppointments = [];
let currentFilter = {
    doctor: 'alle',
    periode: 'dag' 
};

const getVandaagISO = () => new Date().toISOString().split('T')[0];
const SYSTEEM_DATUM = getVandaagISO();

// --- 1. INITIALISATIE ---
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setupAppointmentModal();
    setupEventListeners();
    setupNavigation();
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return;
            
            e.preventDefault();

            if (targetId === '#main-header') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    const offset = 30;
                    const pos = targetEl.offsetTop - offset;
                    window.scrollTo({ top: pos, behavior: 'smooth' });
                }
            }

            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -70% 0px', 
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    ['main-header', 'artsen-anchor', 'appointments-section'].forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY < 50) {
            navLinks.forEach(l => l.classList.remove('active'));
            const homeLink = document.querySelector('a[href="#main-header"]');
            if (homeLink) homeLink.classList.add('active');
        }
    });
}

function setupEventListeners() {
    document.getElementById('filter-dokter')?.addEventListener('change', (e) => {
        currentFilter.doctor = e.target.value; 
        updateDashboardViews();
    });

    document.getElementById('filter-periode')?.addEventListener('change', (e) => {
        currentFilter.periode = e.target.value;
        updateDashboardViews();
    });

    document.querySelector('.logout-btn')?.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
}

async function loadDashboardData() {
    const token = sessionStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    try {
        const response = await fetch('http://localhost:5000/api/admin/department-data', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Data laden mislukt");

        const data = await response.json();
        allAppointments = data.appointments;

        updateCounters(data);
        renderDoctorCards(data.doctors); 
        populateDoctorFilter(data.doctors);
        populateModalDoctorSelect(data.doctors); 
        initCalendar(allAppointments);
        showDayDetails(SYSTEEM_DATUM, allAppointments);
        updateDashboardViews(); 

        if (window.lucide) lucide.createIcons();

    } catch (err) {
        console.error("Dashboard Error:", err);
    }
}

function updateCounters(data) {
    const setStat = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
    setStat('countDoctors', data.doctors.length);
    setStat('countPatients', data.uniquePatients.length);
    setStat('countAppointments', data.appointments.filter(a => a.status === 'GEPLAND').length);
}

function updateDashboardViews() {
    let filtered = allAppointments;

    if (currentFilter.doctor !== 'alle') {
        filtered = allAppointments.filter(a => a.doctor === currentFilter.doctor);
    }

    const totalEl = document.getElementById('total-count');
    const cancelledEl = document.getElementById('cancelled-count');
    const completedEl = document.getElementById('completed-count');

    if (totalEl) totalEl.innerText = filtered.length;
    
    if (cancelledEl) {
        const cancelled = filtered.filter(a => a.status === 'GECANCELLED').length;
        cancelledEl.innerText = cancelled;
    }

    if (completedEl) {
        const completed = filtered.filter(a => a.status === 'VOLTOOID').length;
        completedEl.innerText = completed;
    }

    renderFilteredChart(filtered);       
    updateVandaagTabel();               
    renderAppointmentsTable(filtered);  
}


function renderFilteredChart(filteredData) {
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const periode = currentFilter.periode;
    
    let labels = [];
    let dataIndexFn;
    const currentMonth = new Date(SYSTEEM_DATUM).getMonth();
    const currentYear = new Date(SYSTEEM_DATUM).getFullYear();

    if (periode === 'dag') {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
        dataIndexFn = (date) => (date.getMonth() === currentMonth) ? date.getDate() - 1 : -1;
    } 
    else if (periode === 'week') {
        labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
        dataIndexFn = (date) => (date.getMonth() === currentMonth) ? Math.floor((date.getDate() - 1) / 7) : -1;
    } 
    else {
        labels = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
        dataIndexFn = (date) => date.getMonth();
    }

    const dataGemaakt = new Array(labels.length).fill(0);
    const dataGeannuleerd = new Array(labels.length).fill(0);
    const dataVoltooid = new Array(labels.length).fill(0);

    filteredData.forEach(app => {
        const appDate = new Date(app.date);
        const index = dataIndexFn(appDate);
        if (index >= 0 && index < labels.length) {
            dataGemaakt[index]++;
            
            if (app.status === 'GECANCELLED') dataGeannuleerd[index]++;
            if (app.status === 'VOLTOOID') dataVoltooid[index]++;
        }
    });

    if (statsChart) statsChart.destroy();
    statsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { 
                    label: 'Totaal', 
                    data: dataGemaakt, 
                    borderColor: '#2563eb', 
                    tension: 0.4, 
                    fill: true 
                },
                { 
                    label: 'Voltooid', 
                    data: dataVoltooid, 
                    borderColor: '#22c55e', 
                    tension: 0.4,
                    fill: false
                },
                { 
                    label: 'Geannuleerd', 
                    data: dataGeannuleerd, 
                    borderColor: '#ef4444', 
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function initCalendar(appointments) {
    const calendar = new VanillaCalendar('#calendar', {
        settings: { 
            lang: 'nl-NL', 
            selection: { day: 'single' },
            selected: {
                dates: [SYSTEEM_DATUM], 
                month: new Date(SYSTEEM_DATUM).getMonth(),
                year: new Date(SYSTEEM_DATUM).getFullYear()
            },

            today: new Date(SYSTEEM_DATUM) 
        },
        actions: {
            clickDay(event, self) {
                if (self.selectedDates[0]) {
                    showDayDetails(self.selectedDates[0], appointments);
                }
            },
        },
    });
    calendar.init();

    setTimeout(() => {
        showDayDetails(SYSTEEM_DATUM, appointments);
    }, 100);
}

function showDayDetails(date, appointments) {
    const dayAppts = appointments.filter(a => a.date.substring(0, 10) === date);
    
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'long' 
    });
    
    document.getElementById('selected-date').innerText = formattedDate;

    ['Consult', 'Operatie', 'Check-up'].forEach(type => {
        const count = dayAppts.filter(a => a.type === type).length;
        const id = `count-${type.toLowerCase().replace('-', '')}`;
        const el = document.getElementById(id);
        if (el) el.innerText = count;
    });
}

function updateVandaagTabel() {
    const vandaagTabelBody = document.getElementById('vandaag-table-body');
    const datumLabel = document.getElementById('vandaag-datum-label');
    if (!vandaagTabelBody) return;

    if (datumLabel) {
    const opties = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    datumLabel.innerText = new Date(SYSTEEM_DATUM).toLocaleDateString('nl-NL', opties);
}

    const vandaagAppts = allAppointments.filter(a => a.date.substring(0, 10) === SYSTEEM_DATUM);

    vandaagTabelBody.innerHTML = '';

    if (vandaagAppts.length === 0) {
        vandaagTabelBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Geen afspraken voor vandaag.</td></tr>';
        return;
    }

    vandaagAppts.sort((a, b) => a.time.localeCompare(b.time));

    vandaagAppts.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${app.time}</strong></td>
            <td>
                <div class="main-text">${app.user?.firstName} ${app.user?.lastName}</div>
                <div class="sub-text">ID: ${app.user?.idNumber || 'N/A'}</div>
            </td>
            <td>${app.doctor}</td>
            <td><span class="type-tag">${app.type}</span></td>
            <td><span class="status-pill ${app.status.toLowerCase()}">${app.status}</span></td>
            <td>
                ${app.status === 'GEPLAND' ? `
                    <button onclick="updateStatus(${app.id}, 'VOLTOOID')" class="btn-complete">
                    <i data-lucide="check"></i>
                </button>
                <button onclick="updateStatus(${app.id}, 'GECANCELLED')" class="btn-cancel">
                    <i data-lucide="x"></i>
                </button>
            ` : `<i data-lucide="check-circle" style="color: #22c55e"></i>`}
        </div>
    </td>
`;
        vandaagTabelBody.appendChild(row);
    });
    if (window.lucide) lucide.createIcons();
}

async function updateStatus(id, nieuweStatus) {
    if (nieuweStatus === 'GECANCELLED' && !confirm("Weet je zeker dat je deze afspraak wilt annuleren?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/admin/appointments/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: nieuweStatus })
        });

        if (response.ok) {
            await loadDashboardData(); 
        } else {
            alert("Kon de status niet bijwerken.");
        }
    } catch (err) {
        console.error("Fout bij updaten status:", err);
    }
}

function setupAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    const openBtn = document.getElementById('openModalBtn');
    const form = document.getElementById('appointmentForm');

    if (!modal || !openBtn) return;

    openBtn.onclick = () => { modal.style.display = 'block'; generateTimeSlots(); };
    document.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };

    // Zoekfunctie patienten
    document.getElementById('patientSearchInput')?.addEventListener('input', async (e) => {
        const val = e.target.value;
        if (val.length < 2) return;
        const res = await fetch(`http://localhost:5000/api/admin/patients/search?query=${val}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        const patients = await res.json();
        const list = document.getElementById('patientList');
        list.innerHTML = '';
        patients.forEach(p => {
            const opt = document.createElement('option');
            opt.value = `${p.firstName} ${p.lastName}`;
            opt.label = `ID: ${p.idNumber}`;
            list.appendChild(opt);
        });
    });

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                patientName: form.patientName.value,
                type: form.type.value,
                doctor: form.doctor.value,
                date: form.date.value,
                time: form.time.value
            };
            const res = await fetch('http://localhost:5000/api/admin/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
                body: JSON.stringify(data)
            });
            if (res.ok) { modal.style.display = 'none'; form.reset(); loadDashboardData(); }
        };
    }
}

function generateTimeSlots() {
    const select = document.getElementById('timeSlotSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Kies tijdstip...</option>';
    for (let min = 510; min <= 810; min += 10) { // 08:30 t/m 13:30
        const hh = Math.floor(min / 60).toString().padStart(2, '0');
        const mm = (min % 60).toString().padStart(2, '0');
        const opt = document.createElement('option');
        opt.value = `${hh}:${mm}`;
        opt.textContent = `${hh}:${mm}`;
        select.appendChild(opt);
    }
}

function renderAppointmentsTable(appointments) {
    const tableBody = document.getElementById('appointments-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const weergaveData = [...appointments]
        .sort((a, b) => {
            const datumA = new Date(`${a.date.substring(0, 10)}T${a.time}`);
            const datumB = new Date(`${b.date.substring(0, 10)}T${b.time}`);
            return datumA - datumB;
        })
        .filter(app => {
            const appDatum = new Date(app.date.substring(0, 10));
            const vandaag = new Date(SYSTEEM_DATUM);
            return appDatum >= vandaag; 
        })
        .slice(0, 8);

    weergaveData.forEach(app => {
        const pt = app.user || {};
        const row = document.createElement('tr');
        
        const drInitials = app.doctor ? app.doctor.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
        const isVandaag = app.date.substring(0, 10) === SYSTEEM_DATUM;
        
        if (isVandaag) row.classList.add('row-highlight');

        row.innerHTML = `
            <td>
                <div class="dr-table-cell">
                    <div class="mini-avatar dr-bg">${drInitials}</div>
                    <div>${app.doctor}</div>
                </div>
            </td>
            <td>
                <div class="main-text">${pt.firstName || 'Onbekend'} ${pt.lastName || ''}</div>
                <div class="sub-text">ID: ${pt.idNumber || 'Geen BSN'}</div>
            </td>
            <td><strong>${new Date(app.date).toLocaleDateString('nl-NL')}</strong> - ${app.time}</td>
            <td><span class="status-pill ${app.status.toLowerCase()}">${app.status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

function populateModalDoctorSelect(doctors) {
    const select = document.querySelector('select[name="doctor"]');
    if (select) {
        select.innerHTML = '<option value="">Kies een arts...</option>';
        doctors.forEach(doc => {
            const opt = document.createElement('option');
            opt.value = doc.name; opt.textContent = doc.name; select.appendChild(opt);
        });
    }
}

function populateDoctorFilter(doctors) {
    const select = document.getElementById('filter-dokter'); 
    
    if (select) {
        select.innerHTML = '<option value="all">Alle Doktoren</option>';
        
        doctors.forEach(doc => {
            const opt = document.createElement('option');
            opt.value = doc.name; 
            opt.textContent = doc.name; 
            select.appendChild(opt);
        });
    } else {
        console.error("Kon dropdown 'filter-dokter' niet vinden.");
    }
}

function renderDoctorCards(doctors) {
    const grid = document.getElementById('doctors-grid');
    if (!grid) return;
    grid.innerHTML = '';
    doctors.forEach(doc => {
        const initials = doc.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const card = document.createElement('div');
        card.className = 'doctor-card-mini';
        card.innerHTML = `<div class="dr-avatar-mini">${initials}</div><div class="dr-info-mini"><h4>${doc.name}</h4><p>${doc.specialization || 'Specialist'}</p></div>`;
        grid.appendChild(card);
    });
}