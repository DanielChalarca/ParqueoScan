<div align="center">

# 🚗 Cyclope
### Automated Vehicle Access Control System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?logo=javascript)
![Arduino](https://img.shields.io/badge/Arduino-Uno-teal?logo=arduino)
![Vite](https://img.shields.io/badge/Vite-7.x-purple?logo=vite)

*A smart parking prototype that uses OCR to automatically read license plates, log vehicle entry/exit, and control a physical barrier via Arduino.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Technologies](#-technologies)
- [Project Structure](#-project-structure)
- [Hardware Setup](#-hardware-setup)
- [Wiring Guide](#-wiring-guide)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Arduino](#1-arduino)
  - [Backend](#2-backend-python--ocr)
  - [Frontend & API](#3-frontend--mock-api)
- [How It Works](#-how-it-works)
- [Running the Full System](#-running-the-full-system)

---

## 🧠 Overview

Vehicle entry and exit registration is typically a manual process, prone to delays and human error. **Cyclope** automates this by using a camera and OCR to read license plates in real time. When a plate is detected, the system:

- Logs the **entry or exit** timestamp to a database
- Calculates **parking duration and cost**
- Sends a signal to an **Arduino** to open the physical barrier (servo motor)

---

## 🏗 System Architecture

```
┌─────────────┐     serial (COM7)     ┌─────────────────────┐
│   Arduino   │ ◄──────────────────── │   Python Backend    │
│  (Servo +   │                       │  EasyOCR + OpenCV   │
│  LED/Buzzer)│                       └────────┬────────────┘
└─────────────┘                                │ HTTP (REST)
                                               ▼
                                    ┌─────────────────────┐
                                    │   JSON Server :3000  │
                                    │     (db.json)        │
                                    └────────┬────────────┘
                                             │ HTTP (REST)
                                             ▼
                                    ┌─────────────────────┐
                                    │   Vite Frontend SPA  │
                                    │   localhost:5173     │
                                    └─────────────────────┘
```

---

## ⚙️ Technologies

| Technology | Purpose |
|---|---|
| **HTML + CSS** | User interface design |
| **JavaScript (ES6+)** | SPA logic via DOM manipulation and Fetch API |
| **Vite** | Fast frontend development tooling |
| **JSON Server** | Mock REST API for storing and retrieving records |
| **Python** | Backend OCR service for license plate recognition |
| **EasyOCR + OpenCV** | Image capture and character recognition |
| **pyserial** | Serial communication between Python and Arduino |
| **Arduino (C++)** | Controls servo motor, LED, and buzzer for the barrier |

---

## 📁 Project Structure

```
ParqueoScan/
├── arduino/
│   └── talanquera/
│       └── talanquera.ino      # Arduino sketch: barrier control via serial
│
├── backend/
│   ├── main.py                 # OCR engine: captures plate, logs record, triggers Arduino
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── main.js             # SPA logic: fetch records, mark exits, calculate cost
│   │   └── style.css           # Stylesheet
│   ├── db.json                 # Mock database (registros + trabajadores)
│   ├── index.html              # Main HTML entry point
│   └── package.json            # Node dependencies
│
└── README.md
```

---

## 🔌 Hardware Setup

| Component | Component Pin | Arduino Pin | Wire Color |
|---|---|---|---|
| Servo Motor | Signal | Pin 9 | Orange |
| Servo Motor | VCC | 5V | Red |
| Servo Motor | GND | GND | Brown |
| LED | Anode (+) | Pin 13 | Red |
| LED | Cathode (−) | GND (via 220Ω resistor) | — |
| Buzzer | (+) | Pin 8 | Yellow |
| Buzzer | (−) | GND | Black |

**Behavior:** When Python detects a valid plate, it sends `'1'` over serial → LED and buzzer activate → servo opens to 90° → waits 3 seconds → closes back to 0°

---

## 🧩 Wiring Guide

This section explains step by step how to physically connect all components to the Arduino using a breadboard.

### What you need

- 1× Arduino Uno
- 1× Servo motor (SG90 or similar)
- 1× LED (any color)
- 1× 220Ω resistor
- 1× Passive buzzer
- 1× Breadboard
- Jumper wires

---

### Servo Motor

The servo connects **directly to the Arduino** without going through the breadboard:

- **Orange wire** (signal) → Arduino **Pin 9**
- **Red wire** (VCC) → Arduino **5V**
- **Brown wire** (GND) → Arduino **GND**

> The servo draws enough current from the Arduino 5V pin for low-load use. For heavier servos, use an external power supply.

---

### LED

1. Insert the LED into the breadboard — the **longer leg** (anode) on one row, the **shorter leg** (cathode) on the row below
2. Connect a **220Ω resistor** between the cathode row and the breadboard's **GND rail** — this limits current and prevents burning the LED
3. Connect a jumper wire from the **anode row** to Arduino **Pin 13**
4. Connect a jumper wire from the breadboard's **GND rail** to Arduino **GND**

> Always use a current-limiting resistor with an LED. Without it, the LED will burn out immediately.

---

### Buzzer

1. Insert the buzzer into the breadboard
2. Connect the **positive leg** (+) to Arduino **Pin 8**
3. Connect the **negative leg** (−) to the breadboard's **GND rail**

> Make sure it's a **passive** buzzer (no built-in oscillator). Active buzzers may produce a constant tone instead of responding to the Arduino's signal.

---

### GND Rail

Use the breadboard's **blue (−) power rail** as a shared GND bus:
- Run one wire from Arduino **GND** to the blue rail
- Connect the LED resistor and buzzer negative leg to that same rail

This keeps the wiring clean and avoids plugging multiple wires into the same Arduino GND pin.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js + npm](https://nodejs.org/)
- [Arduino IDE](https://www.arduino.cc/en/software)
- Arduino Uno (or compatible board) connected to **COM7**

---

### 1. Arduino

1. Open **Arduino IDE**
2. Go to `File → Open` and select `arduino/talanquera/talanquera.ino`
3. Go to `Tools → Board` and select your board (e.g. **Arduino Uno**)
4. Go to `Tools → Port` and select **COM7**
5. Click **Upload** (→)

The Arduino will now wait for a `'1'` command over serial to trigger the barrier.

---

### 2. Backend (Python + OCR)

Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

> `requirements.txt` includes: `easyocr`, `opencv-python`, `pyserial`, `requests`, `imutils`

Run the backend:

```bash
python main.py
```

A camera window will open. Press **`c`** to capture and read a plate, or **`q`** to quit.

---

### 3. Frontend & Mock API

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install JSON Server globally (if not already):

```bash
npm install -g json-server
```

---

## ▶️ Running the Full System

Open **3 separate terminals** and run each command:

```bash
# Terminal 1 — Mock API
cd frontend
json-server --watch db.json --port 3000

# Terminal 2 — Frontend
cd frontend
npm run dev

# Terminal 3 — Python OCR Backend
cd backend
python main.py
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Mock API | http://localhost:3000/registros |

---

## 🔄 How It Works

1. **Camera captures** a frame when `c` is pressed
2. **EasyOCR reads** the license plate text from the frame
3. **Python queries** the API — if the plate has an open entry, it logs the exit; otherwise it logs a new entry
4. **Arduino receives** a `'1'` signal via serial → barrier opens for 3 seconds then closes
5. **Frontend displays** all records in real time, showing plate, entry/exit times, duration, and cost

> Workers registered in `db.json → trabajadores` get a discounted rate ($500/hr vs $3000/hr for visitors)
