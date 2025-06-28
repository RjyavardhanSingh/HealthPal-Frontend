
# HealthPal

A sample README for the **HealthPal** project. This document provides setup instructions, usage guidance, and contribution steps for the client-side application.

---

## 📚 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Auth Debug Panel](#auth-debug-panel)
- [Contributing](#contributing)
- [License](#license)
- [Environment Variables](#🌐-environment-variables)

---

## 🩺 Overview

**HealthPal** is a healthcare management application aimed at providing patients and providers with an integrated platform for:

- Appointments  
- Prescriptions  
- Medical records  
- And much more

This README will guide you through the basic setup and usage of the client-side application.

---

## ✨ Features

- User authentication and registration (patient, doctor, and admin roles)  
- Appointment booking and management  
- Prescription creation and viewing  
- Medical record digitization and organization  
- Doctor verification and profile management  
- AI-powered Health Assistant for medical queries  
- Settings pages for updating profile information and security options  
- Debug panel for quickly checking local authentication data  

---

## ⚙️ Installation

1. **Clone or download** this repository.

   ```bash
   git clone https://github.com/RjyavardhanSingh/HealthPal-Frontend.git
   ````

2. **Navigate to the client directory**:

   ```bash
   cd HealthPal/Client
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. *(Optional)* **Create environment variable files** (`.env.development` or `.env.production`) as shown in the [Environment Variables](#🌐-environment-variables) section.

---

## 🚀 Usage

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Open your browser** and visit the address shown in the terminal (typically [http://127.0.0.1:5173/](http://localhost:5173/)).

3. **Log in or register** for an account. Based on your role, you’ll be redirected to the appropriate dashboard:

   * 👨‍⚕️ Doctor
   * 🧑‍🦽 Patient
   * 🛠 Admin

---

## 🤝 Contributing

1. **Fork** the repository.

2. **Create a new feature branch**:

   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Commit your changes**:

   ```bash
   git commit -m "Add some feature"
   ```

4. **Push to your branch**:

   ```bash
   git push origin feature/my-new-feature
   ```

5. **Open a pull request** on GitHub.

---

## 📄 License

This project is provided for **demonstration purposes** and is not distributed under an official license.

If you plan to use or distribute this codebase, please:

* Contact the maintainers
* Or include a suitable open-source license

---

## 🌐 Environment Variables

Do **not** commit actual API keys or secrets to version control. Below are example terminal commands to create the `.env` files with placeholder values.

### 🧪 Create `.env.development`

```bash
cat > .env.development << 'EOF'
VITE_API_URL=http://localhost:5000
VITE_NYT_API_KEY=your_nyt_api_key
VITE_AGORA_APP_ID=your_agora_app_id
VITE_FIREBASE_VAPID_KEY=your_firebase_vapid_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
EOF
```

### 🚀 Create `.env.production`

```bash
cat > .env.production << 'EOF'
VITE_API_URL=https://healthpal-api.onrender.com
VITE_NYT_API_KEY=your_nyt_api_key
VITE_AGORA_APP_ID=your_agora_app_id
VITE_FIREBASE_VAPID_KEY=your_firebase_vapid_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
EOF
```

> 💡 **Tip:** Always add `.env*` files to your `.gitignore` to prevent them from being committed to source control.

---
