const API_URL = 'http://localhost:5000/api/user';

document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
    const userRole = sessionStorage.getItem('role'); 

    if (!token || userRole !== 'PATIENT') {
        alert("Sessie verlopen of onvoldoende rechten. Log opnieuw in.");
        window.location.href = 'index.html'; 
        return;
    }

const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('is-visible');
    });

    loadWelcomeData();
});

function loadWelcomeData() {
    const firstName = sessionStorage.getItem('firstName') || 'Patiënt';
    const lastName = sessionStorage.getItem('lastName') || '';
    
    const welcomeElement = document.querySelector('.username');
    if (welcomeElement) {
        welcomeElement.innerText = `${firstName} ${lastName}`.trim();
    }
}

async function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    modal.style.display = 'block';

    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/profile`, { 
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const user = await response.json();

            document.getElementById('display-name').innerText = `${user.firstName} ${user.lastName}`;
            document.getElementById('display-id').innerText = user.idNumber;
            document.getElementById('display-email').innerText = user.email;

            document.getElementById('ins-company').value = user.insuranceCompany || '';
            document.getElementById('ins-type').value = user.insuranceType || '';
            document.getElementById('ins-number').value = user.insuranceNumber || '';

            if (user.insuranceExpiry) {
                document.getElementById('ins-expiry').value = user.insuranceExpiry.split('T')[0];
            } else {
                document.getElementById('ins-expiry').value = '';
            }
        }
    } catch (err) {
        console.error("Fout bij ophalen profiel:", err);
    }
}

function closeProfileModal() {
    document.getElementById('profile-modal').style.display = 'none';
}

function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let content of tabContents) {
        content.classList.remove("active");
    }

    const tabBtns = document.getElementsByClassName("tab-btn");
    for (let btn of tabBtns) {
        btn.classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

async function saveInsurance() {
    const token = sessionStorage.getItem('token');
    const insuranceData = {
      insuranceCompany: document.getElementById('ins-company').value,
      insuranceType: document.getElementById('ins-type').value,
      insuranceNumber: document.getElementById('ins-number').value,
      insuranceExpiry: document.getElementById('ins-expiry').value
    };

    try {
        const response = await fetch(`${API_URL}/update-profile`, { 
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(insuranceData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Verzekeringsgegevens succesvol bijgewerkt!");
        } else {
            alert(data.error || "Fout bij opslaan");
        }
    } catch (err) {
        console.error("Opslaan mislukt:", err);
        alert("Serverfout bij het opslaan.");
    }
}

document.querySelector('.logout-btn').addEventListener('click', () => {
    if (confirm("Weet u zeker dat u wilt uitloggen?")) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
});

window.onclick = function(event) {
    const modal = document.getElementById('profile-modal');
    if (event.target == modal) {
        closeProfileModal();
    }
}

function handleForgotPassword() {
    alert("Er is een herstel-link gestuurd naar uw geregistreerde e-mailadres.");
}