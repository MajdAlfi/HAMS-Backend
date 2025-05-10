# HAMS - Hospital Administration Management System

HAMS is a full-stack web application designed to manage hospital operations efficiently. It includes user roles like Admin, Doctor, and Patient with features tailored to each.
---

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Jest (for testing)

  ---

## Getting Started

### Backend Setup

```bash
cd HAMS-Backend
npm install
npm start
# or for development
nodemon index.js
```


### Running Tests

```bash
# Backend
cd HAMS-Backend
npm test


---

## Project Structure

### Backend `src/`

```
App/
  └── app.js
Auth/
  ├── get/
  └── post/
Configs/
Doctor/
Model/
Patient/
middleware/
index.js
.env
```

### Backend `tests/`

```
App/
Auth/
Doctor/
Patient/
middleware/
fixtures/
```

---

## Features

- Doctor profile and availability management
- Patient appointment booking and history
- Admin user management
- Calendar view for appointments
- Authentication and role-based access

---

## Development Notes

- Use `.env` files to configure sensitive settings.
- `nodemon` recommended for backend development.

---

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Open a Pull Request

---
