# Navin Frontend

**Navin** is a blockchain-powered logistics platform that improves supply chain visibility for enterprises through tokenized shipments, immutable milestone tracking, and automated settlements.
By creating a zero-trust interface between logistics providers and their clients, Navin ensures both parties access identical real-time data — removing information asymmetry and enabling seamless, dispute-free operations.

This repository is the **React frontend** of the Navin platform — built with **TypeScript** and **Vite** — giving logistics companies and their customers a single, real-time interface to track shipments, verify on-chain milestones, and monitor automated payment settlements powered by [Stellar Soroban](https://soroban.stellar.org/).

> ⭐ **If this project interests you, please star the repository!**
> It helps the project grow, attracts contributors, and supports open-source development.
> [**Star Navin Frontend ⭐**](https://github.com/Navin-xmr/navin-frontend)

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **UI Framework** | [React 19](https://react.dev/) | Component-based UI — the industry standard |
| **Language** | **TypeScript** | Type safety for complex Soroban SDK interactions and multi-dashboard data flows |
| **Build Tool** | [Vite](https://vite.dev/) | Lightning-fast dev server and production bundler |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) | Fast unit and component testing |
| **Routing** | [React Router v7](https://reactrouter.com/) | Client-side navigation |
| **HTTP Client** | [Axios](https://axios-http.com/) | API communication with the Navin backend |
| **Blockchain** | [Stellar Soroban](https://soroban.stellar.org/) | Smart contract interaction for payments and milestones |

> **Why TypeScript?**
> The Soroban Stellar SDK returns complex XDR types and contract client objects.
> TypeScript catches type mismatches at build time — critical when a wrong parameter type means a failed blockchain transaction.
> It also makes the codebase self-documenting for open-source contributors picking up issues.

---

## What the Frontend Does

| Feature | Description |
|---|---|
| **Real-time Shipment Dashboards** | Companies and customers see live shipment status — no information gap between both parties |
| **On-chain Milestone Visualization** | Immutable milestone records (picked up, in transit, delivered) surfaced clearly in the UI |
| **Automated Settlement Tracking** | Payment status updated automatically when verified delivery events occur on-chain |
| **Company Dashboard** | Logistics companies manage shipments, users, and track performance analytics |
| **Customer Dashboard** | Customers track their active shipments and delivery history in one place |
| **Shipment Detail View** | Full breakdown of a single shipment — milestones, IoT sensor data, payment status, and delivery proof |
| **Notification System** | Real-time alerts for shipment updates, delays, and payment events |
| **Responsive Interface** | Works across desktop, tablet, and mobile |

---

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components (Navbar, Modal, StatusBadge, etc.)
│   ├── pages/            # Page-level components (LandingPage, Dashboard, ShipmentDetail, etc.)
│   ├── services/         # Axios API service layer (shipmentService.ts, authService.ts, etc.)
│   ├── context/          # React context providers (ToastContext, AuthContext)
│   ├── hooks/            # Custom React hooks
│   ├── types/            # Shared TypeScript interfaces and types
│   ├── utils/            # Utility/helper functions
│   └── test/             # Test setup and smoke tests
├── public/
│   └── images/           # Static assets (logos, icons, illustrations)
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite + Vitest config
└── package.json
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)

### Installation

```bash
# Fork the repository and clone your fork
git clone https://github.com/yourusername/navin-frontend.git
cd navin-frontend/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Your app runs at `http://localhost:5173`.

### Useful Commands

```bash
npm run dev          # Start local dev server (hot reload)
npm run build        # Type-check + production build
npm run lint         # Run ESLint
npm run test         # Run all tests (Vitest)
npm run test:watch   # Run tests in watch mode
```

---

## Contributing

We welcome contributors of all experience levels — whether you're building your first open-source component or you're a seasoned TypeScript developer.

Read our [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide on branching, commits, PRs, and our review process.

Quick overview:
- Browse open issues on the [Issues page](https://github.com/Navin-xmr/navin-frontend/issues)
- Comment on an issue and wait to be assigned before starting
- Create a branch named `issue#<number>` and implement the feature
- All frontend PRs **must include a screenshot** of the UI change

> 💡 All components should be written in **TypeScript (`.tsx`)**.
> Follow the file structure in each issue — it tells you exactly where to create your files.

---

## Community

Have questions or want to discuss ideas?

- [Navin Telegram Group](https://t.me/+3svwFsQME6k1YjI0)

---

## Related Repositories

- Smart Contracts: [navin-contracts](https://github.com/Navin-xmr/navin-contracts)
- Backend API: [navin-backend](https://github.com/Navin-xmr/navin-backend)

---

## Star the Project ⭐

If you find Navin useful, interesting, or want to support decentralized logistics infrastructure —
**please give us a star on GitHub!**
It helps us attract more contributors and grow the community.

[**⭐ Star Navin Frontend on GitHub**](https://github.com/Navin-xmr/navin-frontend)

---

## License

This project is licensed under the [MIT License](LICENSE).
