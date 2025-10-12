<p align="center">
  <img src="https://i.imgur.com/U82BfGj.png" alt="Loops Logo" width="200"/>
</p>

<h1 align="center">Loops - Your Safety Circle, Reimagined.</h1>

<p align="center">
  <strong>A globally trusted digital public infrastructure (DPI) for life-critical emergency alerting, distinguished by its sovereign architecture, zero operational cost, and unparalleled reliability.</strong>
</p>

---

## Vision
Loops is a living digital safety ecosystem where users participate in intimate, socially accountable communities—Loops—that actively monitor personal and collective well-being. Our vision is to create a universally accessible public safety net, starting with a user-triggered SOS and evolving into an intelligent, automatic check-in system.

For a complete overview of the project's vision, architecture, and requirements, please refer to [`agents.md`](./agents.md), which serves as the single source of truth.

## Key Features (MVP)
The MVP is focused on validating the core technical thesis: a user can trigger an emergency alert that reaches their safety circle in under 2.8 seconds with 99.6% reliability.

*   **Secure Onboarding:** Create an account using email/password or Google OAuth.
*   **SOS Activation Engine:** Trigger an emergency alert via a 3-second hold on a primary button.
*   **Safety Circle Management:** Create and manage a "Safety Circle" with up to 20 members.
*   **Sovereign Notification System:** A three-tier, zero-SMS notification cascade (FCM, WebRTC, Email).
*   **Incident Resolution:** Mark an active SOS as resolved and notify all circle members.
*   **Offline Resilience:** Queue an SOS trigger while offline and sync upon network restoration.

## Tech Stack
The stack is chosen for its ability to deliver on our strict SLAs while minimizing operational complexity.

*   **Frontend:** [**Next.js 14 (App Router)**](https://nextjs.org/)
*   **Backend Platform:** [**Firebase (Unified Platform)**](https://firebase.google.com/)
    *   **Database:** [**Cloud Firestore**](https://firebase.google.com/docs/firestore)
    *   **Authentication:** [**Firebase Authentication**](https://firebase.google.com/docs/auth)
    *   **Messaging:** [**Firebase Cloud Messaging (FCM)**](https://firebase.google.com/docs/cloud-messaging)
    *   **Serverless Compute:** [**Cloud Functions for Firebase (2nd Gen)**](https://firebase.google.com/docs/functions)

## Project Structure
The repository is structured as a "monorepo-lite" using Yarn Workspaces, keeping the frontend and Cloud Functions in a single repo for atomic deploys and shared type definitions.

```
loops-mvp/
├── .github/              # CI/CD Workflows
├── functions/            # Firebase Cloud Functions (Backend)
│   ├── src/
│   └── package.json
├── public/               # Static assets and PWA manifest
├── src/                  # Next.js Frontend Application
│   ├── app/              # Next.js App Router structure
│   ├── components/       # Shared React components
│   ├── lib/              # Helper functions and Firebase client
│   └── types/            # Shared TypeScript interfaces
├── tests/                # E2E, Integration, and Unit tests
├── firebase.json         # Firebase project configuration
├── firebase.rules        # Firestore security rules
├── next.config.js
└── package.json
```

## Getting Started
To get the project up and running on your local machine, follow these steps.

**Prerequisites:**
*   Node.js (v20 or later)
*   Yarn (`npm install -g yarn`)
*   Firebase CLI (`npm install -g firebase-tools`)

**1. Clone the repository:**
```bash
git clone https://github.com/your-org/loops-mvp.git
cd loops-mvp
```

**2. Install dependencies:**
This project uses Yarn Workspaces. Install all dependencies from the root directory.
```bash
yarn install
```

**3. Set up Firebase:**
*   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
*   Add a Web app to your project to get your Firebase configuration keys.
*   Enable the **Firestore, Authentication (Email/Password, Google), Cloud Functions, and Storage** services.
*   Set up the Firebase CLI with your account: `firebase login`.
*   Associate the project with your Firebase project: `firebase use --add`.

**4. Configure environment variables:**
*   Create a `.env.local` file in the root of the project and add your Firebase web app configuration:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    ```

**5. Run the development server & emulators:**
*   Start the Firebase emulators for local development. This command reads the emulator configuration from `firebase.json`.
    ```bash
    firebase emulators:start
    ```
*   In a new terminal, start the Next.js development server:
    ```bash
    yarn dev
    ```
Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Testing
The project includes unit and integration tests.
*   **Unit Tests:** `yarn test:unit`
*   **Integration Tests:** `yarn test:integration` (requires emulators to be running)

## Contributing
We welcome contributions from the community! Please see our `CONTRIBUTING.md` file for details on our code style and PR process.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.