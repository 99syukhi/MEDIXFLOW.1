# 📦 MEDIXFLOW

Een modern zorgmanagementsysteem dat is ontworpen om medische werkprocessen, patiëntgegevens en administratieve processen te stroomlijnen.

---

## 🚀 Functies

* **Patiëntenbeheersysteem**
  Beheer eenvoudig patiëntgegevens en medische informatie.

* **Afspraken plannen**
  Plan, bekijk en beheer afspraken efficiënt.

* **Dashboard met analyses**
  Krijg inzicht in data via overzichtelijke statistieken.

* **Veilige authenticatie en autorisatie**
  Bescherming van gebruikersgegevens met moderne security technieken.

* **Responsieve webinterface**
  Werkt op desktop, tablet en mobiel.

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* Vue.js

### Backend

* Node.js
* Express.js

### Database

* MySQL
* Prisma ORM

### Authentication & Security

* bcrypt (password hashing)
* JSON Web Token (JWT)
* cookie-parser

### Other Tools

* dotenv
* cors
* nodemon (development)

---

## 📁 Project Structure

```
MEDIXFLOW/
│── client/                # Frontend (HTML + CSS + JS + Vue)
│   ├── css/
│   ├── img/
│   ├── js/
│   ├── svg/
│   ├── index.html
│   ├── login_register.html
│   ├── admin-dashboard.html
│   ├── patientportaal.html
│   ├── mijn-afspraken.html
│   ├── nieuwe-afspraak.html
│   ├── beschikbare-tijden.html
│   ├── artsen.html
│   ├── afdelingen.html
│   ├── contact.html
│
│── server/                # Backend (Node.js + Express + Prisma)
│   ├── prisma/            # Prisma schema & migrations
│   ├── routes/            # API route handlers
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── adminRoutes.js
│   │
│   ├── db.js              # Database connection setup
│   ├── server.js          # Main server entry point
│   ├── .env               # Environment variables
│   ├── package.json
│   ├── package-lock.json
│
│── README.md
```

---

## ⚙️ Backend Architectuur

De backend is gebouwd met Express.js en volgt een modulaire en schaalbare structuur.

### 🔹 Kerncomponenten

* **server.js**
  Het startpunt van de applicatie. Initialiseert Express, middleware en routes.

* **db.js**
  Verzorgt de databaseverbinding via Prisma ORM.

* **routes/**
  Bevat alle API-endpoints, logisch gegroepeerd:

  * `authRoutes.js` → Authenticatie (login/registratie)
  * `patientRoutes.js` → Patiëntenbeheer
  * `adminRoutes.js` → Beheerfunctionaliteiten

---

## 🔐 Authenticatiesysteem

* Wachtwoord hashing met bcrypt
* Token-gebaseerde authenticatie met JWT
* Cookies verwerkt via cookie-parser
* Beveiligde routes en sessiebeheer

---

## 🧠 Database Layer

* **ORM:** Prisma
* **Database:** MySQL

### Prisma verzorgt:

1. Database queries
2. Migrations
3. Schema management

---

## ⚡ Installatie & Setup

### 1. Clone de repository

```bash
git clone <repo-url>
cd MEDIXFLOW
```

### 2. Backend setup

```bash
cd server
npm install
```

### 3. Environment variabelen instellen

Maak een `.env` bestand aan in de `server/` map:

```
DATABASE_URL="mysql://user:password@localhost:3306/medixflow"
JWT_SECRET="your_secret_key"
PORT=5000
```

### 4. Prisma setup

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start de server

```bash
node server.js
```

---

## 🌐 Frontend starten

klik op de url in je terminsl en kijk waar ons beroepsproduct overgaat

---

## 👨‍💻 Auteur

Ontwikkeld als onderdeel van ons beroepsproduct voor WebDev.

---

## 📄 Licentie

Dit project is bedoeld voor educatief gebruik.
