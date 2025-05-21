
# Navin Dashboard

Navin is a trustless logistics platform built with transparency in mind. This repository contains the frontend application, which provides real-time dashboards for logistics companies and customers to track package status. It offers a user-friendly interface to interact with the Navin platform, visualize shipment milestones, and monitor IoT data.

## 📦 Overview of Frontend Functionalities

The Navin Frontend provides the following key features:

- 📊 **Real-time dashboards** for logistics companies and customers to track package status.
    
- 👁️ **Visualization of immutable records** of shipment milestones and sensor events (e.g., temperature, delivery) stored on-chain.
    
- 📈 **Display of automated workloads and payments** status triggered by verified delivery.
    
- 📱 **Responsive interface** designed for optimal viewing and usability on all devices (mobile, tablet, desktop).
    

### ⚙️ Key Frontend Components

|                                |                                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **Component**                  | **Description**                                                                                          |
| **Frontend Dashboard**         | React interface for companies and consumers to track package status in real time.                        |
| **User Authentication Module** | Handles user login, registration, and session management.                                                |
| **Shipment Tracking View**     | Displays a list of shipments with their current status and key details.                                  |
| **Detailed Shipment View**     | Shows a comprehensive overview of a single shipment, including milestones, IoT data, and payment status. |
| **Notification System**        | Provides real-time alerts for shipment updates, delays, or critical events.                              |
| **Payment History/Status**     | Displays a record of payments made and their current status.                                             |
| **Admin/Company Dashboard**    | Specific views and functionalities for logistics companies to manage shipments and users.                |
| **Customer Dashboard**         | Specific views for customers to track their individual shipments.                                        |

## 🛠️ Frontend Setup and Initialization

### ✅ Prerequisites

- NodeJS (v16+)
    
- npm 
    

### 🔧 Installation

```
# Clone the frontend repo (assuming it's a separate repository)
git clone https://github.com/Navin-xmr/navin-frontend.git
cd navin-frontend

# Install dependencies
npm install # or yarn install

# Start the development server
npm start # or yarn start
```

_Note: If this frontend is part of a monorepo, adjust the `git clone` and `cd` commands accordingly to navigate to the frontend directory after cloning the main repository._

## 🤝 Contributing

We welcome contributors of all experience levels!

### 🧰 Getting Started

- Look for [good first issues](https://github.com/your-org/project-mercury/issues?q=label%3A%22good+first+issue%22 "null")
    
- Fork the repository
    
- Create a feature branch
    
- Open a pull request
    

### 🌳 Branching Strategy

- `main` → stable release branch
    
- `dev` → active development
    
- `feature/*` → for individual features or fixes
    

### 📂 Code Guidelines

- Keep PRs small and focused
    
- Write clear commit messages
    
- Update docs when necessary
    

## ✍️ Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/ "null") to standardize commit messages.

- `feat`: new feature
    
- `fix`: bug fix
    
- `docs`: documentation only
    
- `refactor`: code changes without feature/fix
    
- `chore`: maintenance tasks
    

## 📩 Contact Us

Have questions or feedback?

- 💬 Telegram: [Navin Telegram Group](https://t.me/+_pG9G6Lrqn81MjNk "null")
    

## 🛡️ License

This project is licensed under the [MIT License](https://chatgpt.com/c/LICENSE "null").
