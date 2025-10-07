<p align="center">
  <img src="https://i.imgur.com/U82BfGj.png" alt="Loops Logo" width="200"/>
</p>

<h1 align="center">Loops - Your Safety Circle, Reimagined.</h1>

<p align="center">
  <strong>A globally trusted digital public infrastructure (DPI) for life-critical emergency alerting, distinguished by its sovereign architecture, zero operational cost, and unparalleled reliability.</strong>
</p>

---

## Vision
In a world filled with slow, expensive, and unreliable safety apps, Loops establishes an unassailable competitive moat through its engineering choices. By building on a zero-cost, sovereign notification stack (FCM + WebRTC), we eliminate the primary barrier to scaling as a true public utility—messaging costs. Our vision is to create a universally accessible public safety net, starting with university students and expanding to municipalities and healthcare systems.

While the long-term vision for Loops includes a sophisticated, AI-powered check-in system that learns the rhythm of your life, this repository contains the **Minimum Viable Product (MVP)** focused on validating the core technical thesis: a user can trigger an emergency alert that reaches their safety circle in under 2.8 seconds with 99.6% reliability, without a single line of SMS infrastructure or a single cent of messaging cost.

## Key Features (MVP)
The MVP is defined by its ruthless focus on the core alerting loop.

*   **Secure Onboarding:** Create an account using email/password or Google OAuth with a guided, multi-step process for security and permission setup.
*   **SOS Activation Engine:** Trigger an emergency alert via a 3-second hold on a primary button. A silent activation mode (device shake or voice phrase) is available for coercion scenarios.
*   **Safety Circle Management:** Create and manage a single "Safety Circle" with up to 20 members, inviting them through a secure, closed-network workflow.
*   **Intelligent Contact Routing:** Manage up to 10 emergency contacts within your circle, assigning priority tiers to guide the notification cascade.
*   **Sovereign Notification System:** A three-tier, zero-SMS notification cascade (FCM, WebRTC, Email) designed to achieve a 99.6% success rate.
*   **Incident Resolution:** A simple in-app workflow to mark an active SOS as resolved and notify all circle members.
*   **Offline Resilience:** Trigger an SOS while completely offline. The event is securely queued and synced upon network restoration.
*   **Basic Operational Dashboard:** A real-time view of your current SOS status and a 30-day history of past events.

## Tech Stack
The stack is chosen for its ability to deliver on our strict SLAs while minimizing operational complexity and maximizing developer velocity.

*   **Frontend:** [**Next.js 14 (App Router)**](https://nextjs.org/) - For a superior developer experience, server components, and seamless integration with Vercel's Edge Network.
*   **Backend Platform:** [**Firebase (Unified Platform)**](https://firebase.google.com/)
    *   **Database:** [**Cloud Firestore**](https://firebase.google.com/docs/firestore) - For powerful querying and robust offline persistence.
    *   **Authentication:** [**Firebase Authentication**](https://firebase.google.com/docs/auth) - For a secure, standards-based identity system.
    *   **Messaging:** [**Firebase Cloud Messaging (FCM)**](https://firebase.google.com/docs/cloud-messaging) - The backbone of our zero-cost, high-reliability notification strategy.
    *   **Serverless Compute:** [**Cloud Functions for Firebase (2nd Gen)**](https://firebase.google.com/docs/functions) - To ensure low-latency, high-performance backend logic.

## Project Structure
The repository is structured as a "monorepo-lite," keeping the frontend and Cloud Functions in a single repo for atomic deploys and shared type definitions.

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
*   Node.js (v18 or later)
*   Firebase CLI (`npm install -g firebase-tools`)

**1. Clone the repository:**
```bash
git clone https://github.com/your-org/loops-mvp.git
cd loops-mvp
```

**2. Install dependencies:**
```bash
npm install
cd functions && npm install && cd ..
```

**3. Set up Firebase:**
*   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
*   Add a Web app to your project to get your Firebase configuration keys.
*   Set up the Firebase CLI with your account: `firebase login`.
*   Associate the project with your Firebase project: `firebase use --add`.

**4. Configure environment variables:**
*   Create a `.env.local` file in the root of the project and add your Firebase web app configuration:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    # ... and so on
    ```

**5. Run the development server & emulators:**
*   Start the Firebase emulators for local development:
    ```bash
    firebase emulators:start
    ```
*   In a new terminal, start the Next.js development server:
    ```bash
    npm run dev
    ```
Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Future Roadmap
The MVP is just the beginning. Our long-term vision is to build the most intelligent and comprehensive personal safety platform ever created. Future phases will include:
*   **The Intelligent Check-In System:** An AI-powered system that learns your life's unique rhythm and patterns to provide automatic, effortless reassurance.
*   **Specialized Safety Modes:** Unique configurations for students, families, travelers, and more.
*   **Community & Networks:** Advanced safety networks that allow circles to interconnect intelligently.
*   **Predictive Safety Intelligence:** A system that analyzes routes, environmental context, and behavioral patterns to prevent incidents before they happen.

## Contributing
We welcome contributions from the community! If you're interested in helping build the future of personal safety, please see our `CONTRIBUTING.md` file for details on our code style, PR process, and more. (Note: `CONTRIBUTING.md` is a placeholder for now).

## License
This project is licensed under the MIT License. See the `LICENSE` file for details. (Note: `LICENSE` file is a placeholder for now).