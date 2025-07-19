# 🚗 Cyclope - Automated Vehicle Access Control

Vehicle entry and exit registration processes are typically carried out manually by staff who record vehicle information for access control purpose.
By automating this process, user wait times can be significantly reduced, enabling smoother flow of vehicle. Whith **CYCLOPE**, a character recognition system using cameras is implemented to automatically capture vehicle data during entry and exit. This information is then stored and processed to enhace vehicule access management and control.
by integrating a fontend **SPA** (built whit **Vite**), a **Python-based OCR** backend, and a mock **API** with **JSON server**, **CYCLOPE** provides a fast, testtable and scalable prototype for smart parking or access control system.
---
## ⚙️ Technologies Used

| **Technology**                                   | **Usage**                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| **HTML + CSS**                                   | User interface design                                                     |
| **JavaScript**                                   | Dynamic single-page application (SPA) using DOM manipulation and Fetch    |
| **Vite**                                         | Development tooling for a fast Vanilla JS project                         |
| **JSON Server**                                  | Mock API for storing and retrieving data                                  |
| **Python**                                       | Backend service to process license plate images for character recognition |
| **EasyOCR + Imutils + OpenCV-python + Requests** | Python libraries for OCR and image preprocessing                          |
---

## 📁 Project structure

```
├── backend/ # Python backend
│ └── main.py # Captures characters from license plate images
│
├── frontend/ # Frontend SPA
│ ├── public/ # Public assets (if applicable)
│ ├── src/ # Source files
│ │ ├── main.js # SPA logic: add items, send data to backend
│ │ └── style.css # Main stylesheet
│ ├── .gitignore # Git ignore rules
│ ├── db.json # Mock database for users, workers, and records
│ ├── index.html # Main HTML file
│
└── README.md # Project overview and usage instructions
```
---
## General Functionalities

* Vehicle Entry Control.
* Vehicle Entry and Exit Time Control
* Basic Authentication: Simulates a login/logout system to differentiate between user and administrator roles.

## Admin functionalities (CRUD-Parking Lot)

Users with an administrator role have access to a complete control panel for event management (CRUD - Create, Read, Update, Delete).

* Create New License Plate: Save a new license plate each time a vehicle enters the parking lot.
* General List: View all vehicles that have entered and the position where each one is currently located.
* Edit Vehicle User Information: Update the details of the user associated with a specific vehicle
* Delete Vehicle Owner Information and Exit Record: Remove the details of the vehicle's owner along with the record of its departure from the parking lot.
* Capacity Management: Control the Maximum Number of Vehicles Based on Available Parking Space
  
## User Functionalities (Parking Lot)

* Register and Log In.
* View Available: View History and Duration of Vehicle Stay in the Parking Lot.


## 🚀 How to Run

### Backend setup

* First, install the required dependencies for the backend:

```bash
cd backend/
pip install requests
pip install easyocr
pip install opencv-python easyocr imutils
```
Then, run the backend service:
```bash
python main.py
```

Make sure Python and pip are installed on your system.

### frontend setup
* Install the required dependencies and start the development server:
```
cd frontend/
npm install
npm run dev
```
Make sure you Node.js and npm are installed on your system.

* Install JSON Server globally (if not already installed):
```
npm install -g json-server
```
Then, run the mock API:
```
cd frontend/
json-server --watch db.json --port 3000
```
---

## Test Accounts

You can use the following credentials to test the different functionalities:

* Admin:

  * Username: admin
  * Password: admin123

## Standard User:

* User:

  * Username: user123
  * Password: user123

# 📝 License
This project is for educational and prototyping purposes.
