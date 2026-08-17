# SparkToCode-team-6-final-project
# Real Estate Listing & Management System

A platform where agents list properties for sale/rent, clients browse listings, save favorites, schedule viewings, and sign contracts.

---

## Tech Stack

- **Backend:** ASP.NET Core Web API (.NET 10), Entity Framework Core (Code-First)
- **Database:** SQL Server (via Docker)
- **Auth:** JWT (JSON Web Tokens)
- **Email:** SMTP email service (viewing confirmations & contract-signed notifications)
- **Frontend:** HTML, CSS, JavaScript, Bootstrap
- **API Docs:** Swagger

---

## How to Run

This starts everything in one process:
- **API + Swagger:** `https://localhost:7235/swagger`
- **Frontend:** `https://localhost:7235` (serves `wwwroot/index.html` automatically)

### Log in
Register a user via `register.html`, then log in via `login.html`. The JWT token is stored automatically and attached to protected API requests.

---

## Project Structure

```
Team 6/team6/
├── Controllers/       # One controller per model (8+ endpoints each)
├── Models/             # EF Core entity classes
├── Migrations/         # EF Core migration history
├── Services/           # Email service
├── wwwroot/             # Frontend (HTML, CSS, JS)
├── Program.cs           # App startup, JWT & Swagger config
├── ProjectContex.cs     # EF Core DbContext
└── docker-compose.yml   # SQL Server container
```

---

## Core Entities (12)

| # | Entity | Owner |
|---|---|---|
| 1 | User (Client / Agent / Admin) | Dev 1 |
| 2 | Agent Profile | Dev 1 |
| 3 | Property | Dev 2 |
| 4 | PropertyType | Dev 2 |
| 5 | Listing | Dev 3 |
| 6 | Viewing | Dev 3 |
| 7 | Favorite | Dev 4 |
| 8 | Review | Dev 4 |
| 9 | Contract | Dev 5 |
| 10 | Payment | Dev 5 |
| 11 | City | Dev 6 |
| 12 | Amenity | Dev 6 |

---

## Team & Responsibilities

Each developer owned their 2 models end-to-end: ERD design, C# model + DbContext registration, controller (8+ endpoints), Swagger/Postman testing, and the matching frontend pages.

| Developer | Models | Pages |
|---|---|---|
| **Dev 1** | User, Agent Profile | `login.html`, `register.html`, `users.html`, `agents.html` |
| **Dev 2** | Property, PropertyType | `Properties.html`, `property-form.html`, `PropertyTypes.html` |
| **Dev 3** | Listing, Viewing | `Listings.html`, `Viewings.html` |
| **Dev 4** | Favorite, Review | `favorites.html`, `reviews.html` |
| **Dev 5** | Contract, Payment | `contracts.html`, `payment.html` |
| **Dev 6** | City, Amenity | `cities.html`, `amenities.html` |

---


## API Documentation

Once the project is running, Swagger is available at:
```
https://localhost:7235/swagger
```
---
