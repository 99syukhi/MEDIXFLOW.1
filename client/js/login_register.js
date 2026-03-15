const API_URL = 'http://localhost:5000/api/auth';

function showLoginForm(role) {
    const roleSelection = document.getElementById('role-selection');
    const subtitle = document.getElementById('form-subtitle');
    const patientForm = document.getElementById('patient-form');
    const adminForm = document.getElementById('admin-form');

    roleSelection.style.display = 'none';

    if (role === 'patient') {
        patientForm.style.display = 'block';
        subtitle.innerText = "Inloggen als Patiënt";
    } else {
        adminForm.style.display = 'block';
        subtitle.innerText = "Inloggen Systeem (Administratie)";
    }
}

function resetLogin() {
    document.getElementById('patient-form').style.display = 'none';
    document.getElementById('admin-form').style.display = 'none';
    document.getElementById('role-selection').style.display = 'grid';
    document.getElementById('form-subtitle').innerText = "Selecteer uw rol om verder te gaan";
}

function showForm(target) {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    if (target === 'register') {
        loginSection.style.display = 'none';
        registerSection.style.display = 'flex';
    } else {
        loginSection.style.display = 'flex';
        registerSection.style.display = 'none';
        resetLogin();
    }
}

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    if (!passwordInput) return;

    const wrapper = passwordInput.closest('.wachtwoord-wrapper');
    const eyeOff = wrapper.querySelector('.lucide-eye-off');
    const eyeOn = wrapper.querySelector('.lucide-eye');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (eyeOff) eyeOff.style.display = 'none';
        if (eyeOn) eyeOn.style.display = 'block';
    } else {
        passwordInput.type = 'password';
        if (eyeOff) eyeOff.style.display = 'block';
        if (eyeOn) eyeOn.style.display = 'none';
    }
}

document.querySelector('#register-section form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('wachtwoord-conf').value;

    if (password !== confirmPassword) {
        alert("Wachtwoorden komen niet overeen!");
        return;
    }

    const formData = {
        firstName: document.getElementById('reg-firstname').value,
        lastName: document.getElementById('reg-lastname').value,
        idNumber: document.getElementById('reg-idnumber').value,
        email: document.getElementById('reg-email').value,
        password: password,
        role: 'PATIENT'
    };

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json(); 

        if (response.ok) {
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('userRole', data.role);
            sessionStorage.setItem('firstName', data.firstName); 
            sessionStorage.setItem('lastName', data.lastName); 
            
            alert("Registratie succesvol! Welkom bij MedixFlow.");
            window.location.href = 'patiëntportaal.html';
        } else {
            alert(data.error || "Fout bij registreren");
        }
    } catch (err) {
        alert("Serverfout: kan geen verbinding maken.");
    }
});

const handleLogin = async (e, formId) => {
    e.preventDefault();
    const form = document.getElementById(formId);

    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    const role = (formId === 'admin-form') ? 'ADMIN' : 'PATIENT';
    const department = (role === 'ADMIN') ? form.querySelector('select[name="afdeling"]').value : null;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role, department })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('userRole', data.role);
            sessionStorage.setItem('firstName', data.firstName); 
            sessionStorage.setItem('lastName', data.lastName);
            
            if (data.department) sessionStorage.setItem('userDept', data.department);

            if (data.role === 'ADMIN') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'patiëntportaal.html';
            }
        } else {
            alert(data.error || "Inloggen mislukt");
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Serverfout tijdens het inloggen.");
    }
};

document.querySelector('#patient-form form').addEventListener('submit', (e) => handleLogin(e, 'patient-form'));
document.querySelector('#admin-form form').addEventListener('submit', (e) => handleLogin(e, 'admin-form'));