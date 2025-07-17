# 🚗 Cyclope - Automated Vehicle Access Control
## 🧠 Description
Vehicle entry and exit registration processes are typically carried out manually by staff who record vehicle information for access control purpose.
By automating this process, user wait times can be significantly reduced, enabling smoother flow of vehicle. Whith **CYCLOPE**, a character recognition system using cameras is implemented to automatically capture vehicle data during entry and exit. This information is then stored and processed to enhace vehicule access management and control.
by integrating a fontend **SPA** (built whit **Vite**), a **Python-based OCR** backend, and a mock **API** with **JSON server**, **CYCLOPE** provides a fast, testtable and scalable prototype for smart parking or access control system.
---
## ⚙️ Technologies Used

| **Technology**    | **Usage**                                                              |
| ----------------- | ---------------------------------------------------------------------- |
| **HTML + CSS**    | User interface design                                                  |
| **JavaScript**    | Dynamic single-page application (SPA) using DOM manipulation and Fetch |
| **Vite**          | Development tooling for a fast Vanilla JS project                      |
| **JSON Server**   | Mock API for storing and retrieving data                               |
| **Python**        | Backend service to process license plate images for character recognition |
| **EasyOCR + Imutils** | Python libraries for OCR and image preprocessing                   |

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

## 🚀 How to Run

### Backend setup

* First, install the required dependencies for the backend:

```bash
cd backend/
pip install easyocr
pip install easyocr imutils
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

# 📝 License
This project is for educational and prototyping purposes.
