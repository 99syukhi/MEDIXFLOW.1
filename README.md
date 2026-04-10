# 📦 MEDIXFLOW

MEDIXFLOW is een modern zorgmanagementsysteem dat medische werkprocessen digitaliseert en vereenvoudigt.  
Het systeem stelt zorgverleners in staat om patiëntgegevens te beheren, afspraken te plannen en inzicht te krijgen via dashboards.

Het doel van dit project is om een efficiënte, veilige en gebruiksvriendelijke oplossing te bieden voor zowel medische professionals als patiënten.

---
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
- Node.js (v18+)
- Express.js (v4.19.2)

### Database
- MySQL (v8)
- Prisma ORM (v6.4.1)

### Authentication & Security
- bcrypt (v6.0.0)
- JSON Web Token (jsonwebtoken v9.0.3)
- cookie-parser (v1.4.7)

### Tools
- dotenv (v17.3.1)
- cors (v2.8.6)
- nodemon (v3.1.14)

---
## 📋 Prerequisites

Zorg dat je het volgende hebt geïnstalleerd:

- Node.js ≥ 18.x
- npm ≥ 9.x
- MySQL ≥ 8.x
- Prisma ≥ 6.4.1
  
---

## ⚡ Installatie & Setup

### 1. Clone de repository

```bash
git clone <repo-url>
cd MEDIXFLOW
```

### 2. Installeer backend dependencies

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
Na het starten van de server verschijnt er een URL in de terminal, bijvoorbeeld:

```bash
http://localhost:5000
```
Klik op deze URL (of kopieer en plak deze in je browser) om de applicatie te openen.

## ⚙️ Configuration

De applicatie maakt gebruik van environment variables voor configuratie.  
Deze moeten worden ingesteld in een `.env` bestand in de `server/` map.

### Vereiste environment variables

| Variabele     | Verplicht | Beschrijving |
|--------------|-------------|-------------|
| DATABASE_URL | Ja      | Connectiestring voor de MySQL database |
| JWT_SECRET   | Ja      | Secret key voor het genereren en verifiëren van JWT tokens |
| PORT         | Nee     | Poort waarop de server draait (default: 5000) |

---

## 📁 Folder Structure

De repository is opgesplitst in een frontend (`client`) en backend (`server`) voor een duidelijke scheiding van verantwoordelijkheden.

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

### Structuur uitleg

- **client/** bevat alle frontend bestanden en UI pagina’s  
- **server/** bevat de backend logica en API  
- **routes/** groepeert endpoints per functionaliteit  
- **prisma/** beheert database schema en migraties  
- **db.js** verzorgt de database connectie  
- **server.js** start de applicatie en configureert middleware  

Deze structuur zorgt voor een duidelijke scheiding tussen frontend en backend, wat de onderhoudbaarheid en schaalbaarheid verbetert.

---

## 🏗️ Architecture

MEDIXFLOW volgt een **client-server architectuur** waarbij de frontend, backend en database gescheiden zijn maar samenwerken via API calls.

---

### Systeemoverzicht
Frontend (Client)
      ↓ HTTP Requests (fetch / API calls)
Backend (Express.js API)
      ↓ ORM (Prisma)
Database (MySQL)

---

### Componenten

### Frontend (Client)
- Gebouwd met HTML, CSS, JavaScript en Vue.js
- Verantwoordelijk voor de gebruikersinterface
- Stuurt requests naar de backend via API calls

---

### Backend (Server - Node.js + Express)

De backend verwerkt alle logica en API requests.

#### Kernbestanden
- **server.js**
  Startpunt van de applicatie (Express setup + middleware + routes)

- **db.js**
  Database connectie via Prisma ORM

#### Routes
Alle API endpoints zijn gestructureerd in modules:

- `authRoutes.js` → Login & registratie
- `patientRoutes.js` → Patiëntbeheer
- `adminRoutes.js` → Admin functionaliteiten

---

### Database (MySQL + Prisma)

De database slaat alle applicatiegegevens op en wordt beheerd via Prisma ORM.

---

### Database rol
- Slaat alle applicatie data op
- Bevat o.a. users, patiënten en afspraken
- Zorgt voor persistente opslag van data

---

### Prisma ORM
Prisma fungeert als bridge tussen de backend en de database.

Prisma verzorgt:

1. Database queries uitvoeren
2. Migrations beheren
3. Schema management
4. Type-safe database communicatie

---

### Werking

Backend (Node.js / Express) → Prisma ORM → MySQL Database

---

### Belangrijk
Prisma zorgt ervoor dat database queries veilig en gestructureerd worden uitgevoerd zonder directe SQL queries in de backend.

---

### Data Flow

1. Gebruiker voert actie uit in de frontend  
2. Frontend stuurt request naar Express API  
3. Backend verwerkt request en voert database query uit via Prisma  
4. Database retourneert data  
5. Backend stuurt response terug naar frontend  
6. Frontend toont de data aan de gebruiker

---

### Security Layer
- JWT tokens worden gebruikt om routes te beveiligen
- bcrypt zorgt voor veilige wachtwoord hashing
- cookies worden gebruikt voor sessiebeheer

---

## 🔗 API Documentation

De API volgt REST conventions en gebruikt JSON voor data-uitwisseling.

## Authentication API

Deze endpoints regelen registratie en login van gebruikers.  
Authenticatie gebeurt via JWT tokens.

---

## POST /api/auth/register

Registreert een nieuwe gebruiker.

### Request Body

```json id="r1"
{
  "firstName": "John",
  "lastName": "Doe",
  "idNumber": "123456",
  "email": "john@example.com",
  "password": "password123",
  "role": "PATIENT"
}
```

### Response (201)

```
{
  "message": "Registratie succesvol!",
  "token": "jwt_token",
  "role": "PATIENT",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Errors
- 400 → Email of ID-nummer bestaat al
- 500 → Server error

## POST /api/auth/login

Logt een gebruiker in en retourneert een JWT token.

### Request Body

```
{
  "email": "john@example.com",
  "password": "password123",
  "role": "PATIENT",
  "department": "CARDIOLOGY"
}
```

### Response (200)

```
{
  "token": "jwt_token",
  "role": "PATIENT",
  "firstName": "John",
  "lastName": "Doe",
  "department": "CARDIOLOGY"
}
```

### Errors
- 401 → Onjuiste login gegevens of verkeerde rol
- 401 → Geen toegang tot afdeling (admin check)
- 500 → Serverfout

## Authenticatiesysteem & Regels

 * Passwords worden gehashed met bcrypt
 * Cookies worden verwerkt via cookie-parser
 * Tokens worden gegenereerd met JWT
       * Token expiry:
           - Register: 2 uur
           - Login: 24 uur
 * Routes en sessiebeheer zijn beveiligd
   
---

## Admin API

Deze endpoints zijn bedoeld voor administrators om ziekenhuis- en afdelingsgegevens te beheren en in te zien.  
Alle routes zijn beveiligd met JWT-authenticatie en vereisen ADMIN-rechten om toegang te krijgen.

De admin API biedt functionaliteiten zoals het beheren van afspraken, het zoeken van patiënten en het ophalen van afdeling-specifieke data.

---

## Patient API

Deze endpoints stellen patiënten in staat om hun profiel te beheren, afspraken in te plannen en hun persoonlijke medische gegevens te bekijken.
Alle routes zijn beveiligd met JWT-authenticatie, waardoor alleen ingelogde gebruikers toegang hebben tot hun eigen data.

---

## Database Design

De database is opgebouwd met MySQL en beheerd via Prisma ORM.  
Het schema bestaat uit gebruikers, patiënten en afspraken met onderlinge relaties.

---

```
model User {
  id                Int           @id @default(autoincrement())
  firstName         String
  lastName          String
  idNumber          String        @unique
  email             String        @unique
  password          String
  role              String        @default("PATIENT")
  department        String?
  insuranceCompany  String?
  insuranceType     String?
  insuranceNumber   String?
  insuranceExpiry   String?
  createdAt         DateTime      @default(now())

  appointments      Appointment[] 
}

model Appointment {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  doctor      String
  department  String   // Bijv. "Kaakchirurgie"
  date        DateTime
  time        String
  status      String   @default("GEPLAND") 
  type        String   @default("Consult") // Consult, Check-up, Operatie
  notes       String?  @db.Text
  createdAt   DateTime @default(now())
}
```

---

## Relaties
- User → Appointment
    - Eén user kan meerdere afspraken hebben
    - Elke afspraak hoort bij één user

---

## Database Structuur Uitleg

### User

Bevat alle gebruikersgegevens zoals:
1. Persoonlijke info
2. Login data
3. Verzekeringsgegevens

### Appointment

Bevat alle afspraakinformatie:
1. Dokter
2. Datum & tijd
3. Status (GEPLAND, VOLTOOID, GECANCELLED)

--- 

## 👨‍💻 Auteur

Ontwikkeld als onderdeel van ons beroepsproduct voor WebDev.

---

## 📄 Licentie

Dit project is bedoeld voor educatief gebruik.
