**Loops – Minimum Viable Product (MVP) Blueprint: Phase 1 Sovereign Alert System**  
**A Complete, Production-Ready Specification for a GitHub Repository**  

---

### **I. Executive Summary & Strategic Foundation**

**Vision Statement:** Loops will become a globally trusted digital public infrastructure (DPI) for life-critical emergency alerting, distinguished by its sovereign architecture, zero operational cost, and unparalleled reliability. The Phase 1 MVP is not a prototype but a production-grade, legally compliant, and ethically sound application that validates our core technical thesis: a user can trigger an emergency alert that reaches their safety circle in under 2.8 seconds with 99.6% reliability, without a single line of SMS infrastructure or a single cent of messaging cost.

**Strategic Imperative:** In a market saturated with slow, expensive, and unreliable safety apps, Loops establishes an unassailable competitive moat through its engineering choices. By building on a zero-cost, sovereign notification stack (FCM + WebRTC), we eliminate the primary barrier to scaling as a true public utility—messaging costs. This is not a cost optimization; it is a foundational strategic decision that enables our go-to-market with universities, municipalities, and healthcare systems who cannot bear per-message fees at scale. If our system incurred even a fraction of a cent per message, our vision of a universally accessible public safety net would be economically unviable.

**Target User & Problem:** Our primary user is the university student—a demographic that is highly mobile, operates in congested network environments (campus WiFi), and faces unique safety challenges. They are failed by existing solutions that are too slow (industry average 8.5s activation), too expensive (SMS-based), and too conspicuous (lack of silent, trauma-informed activation). Loops solves this with a system that is fast, free, and discreet. The student demographic is our beachhead because they are a concentrated, high-risk group with a strong network effect; a single campus adoption can onboard thousands of users simultaneously, creating a dense safety graph that validates our network effects for future expansion into other segments like hospitals and municipalities.

**Regulatory & Ethical Context:** As a life-critical application handling sensitive location and personal contact data, Loops must be built with compliance and ethics as first principles. This means adhering to the highest standards of data privacy (GDPR, CCPA), accessibility (WCAG 2.1 AAA), and security from day one. We adopt a “zero PHI” (Protected Health Information) policy, meaning we will never store or process data that could be classified as health information under HIPAA. Our data model is designed to be minimal and purpose-limited, collecting only the data absolutely necessary to fulfill the core alerting function. This proactive compliance strategy is not a legal checkbox; it is a core product feature that builds trust with our institutional partners.

---

### **II. MVP Definition: The Bare Minimum for a Life-Critical System**

The MVP is defined by its ruthless focus on the core alerting loop. It is the smallest system that can be deployed to a user and provide a complete, end-to-end safety utility. Every feature is evaluated against the question: “Is this absolutely necessary for a user to send and receive a life-critical alert?”

#### **In-Scope: The Core Alerting Loop (Mandatory for Launch)**
1.  **Secure Onboarding:** A user can create an account using email/password or Google OAuth. The onboarding flow is a multi-step, guided process that includes:
    *   **Step 1: Account Creation.** Standard email/password or Google sign-in.
    *   **Step 2: Security Setup.** A mandatory prompt to enable MFA (Multi-Factor Authentication) readiness. The user is not forced to set up MFA immediately but is guided through the process and must acknowledge its importance. This step also includes a clear privacy policy acceptance.
    *   **Step 3: Permission Granting.** A clear, contextual request for the necessary browser permissions: **Location** (for accurate SOS coordinates) and **Notifications** (for receiving alerts from others). The UI must explain *why* each permission is needed in simple, non-technical language.
    *   **Step 4: Circle Creation.** The user is prompted to create their first (and only, for MVP) Safety Circle and is guided to add their first emergency contact.
2.  **SOS Activation Engine:** The user can trigger an emergency alert via a 3-second hold on a primary button. A silent activation mode must be available, triggered by a device shake or the voice phrase "I'm okay," to address coercion scenarios. The engine must be resilient to false triggers and provide immediate, unambiguous feedback to the user.
3.  **Safety Circle Management:** The user can create and manage a single default "Safety Circle" containing up to 20 members. An invite workflow allows adding members via email or phone number, but the invitee must complete their own Loops onboarding to join, ensuring a closed, sovereign network. The circle is the fundamental unit of trust and notification routing.
4.  **Intelligent Contact Routing:** The user can manage up to 10 emergency contacts within their circle. Each contact is validated (E.164 for phone numbers) and assigned a priority tier (1, 2, or 3) to guide the notification cascade. Priority 1 contacts are notified first and most aggressively, while Priority 3 contacts serve as a final fallback.
5.  **Sovereign Notification System:** Upon SOS activation, a three-tier, zero-SMS notification cascade is initiated to deliver the alert to all circle members, achieving a 99.6% success rate. The system must be completely independent of any third-party SMS gateway (e.g., Twilio, Vonage).
6.  **Incident Resolution:** The user has a simple in-app workflow to mark an active SOS as resolved, providing a reason (e.g., "False Alarm," "All OK"). This resolution event must be broadcast to all circle members to close the loop and prevent unnecessary panic or response.
7.  **Offline Resilience:** The user can trigger an SOS while completely offline. The event is securely queued and will be synced to the server and delivered to the circle upon network restoration, with a 95% success rate within 10 minutes. This is not a “nice-to-have” but a core requirement for our primary user segment.
8.  **Basic Operational Dashboard:** The user has a real-time view of their current SOS status and a read-only, 30-day history of past events for audit and review. The dashboard provides immediate situational awareness during an active incident.

#### **Out-of-Scope: Explicitly Deferred to V2.0**
*   **Social Features:** Any form of community feed, comments, likes, or media sharing. These introduce significant content moderation risk and distract from the core utility.
*   **Event Management:** The ability to create, schedule, or manage events with geo-fencing or capacity limits. This is a complex V2 feature that requires a different data model and real-time coordination logic.
*   **Advanced Analytics:** Any reporting, data export, or complex dashboarding beyond the 30-day history. Our focus is on operational utility, not data analysis, in Phase 1.
*   **Granular Roles & Permissions:** Specialized roles like "Caregiver" or "Admin" with custom views or controls. The MVP supports a flat, peer-to-peer circle model.
*   **Public Emergency Integration:** Any direct API integration with 911, 112, or other public safety answering points (PSAPs). This is a complex, regulated space that is out of scope for an MVP.
*   **Native Mobile Apps:** The MVP is a Progressive Web App (PWA). This allows us to ship a single, high-fidelity codebase to all platforms (iOS, Android, Desktop) simultaneously, maximizing our development velocity and ensuring a consistent user experience. Native apps will be considered for V2 based on PWA performance data.

---

### **III. Phase 0: The Non-Negotiable Foundation**

All work in this phase is a strict prerequisite. No Phase 1 feature code will be accepted into the main branch until Phase 0 is complete, tested, and audited. This phase is about building the bedrock of trust.

#### **A. Core Technical Architecture & Rationale**

The stack is chosen for its ability to deliver on our SLAs while minimizing operational complexity and maximizing developer velocity.

*   **Frontend Framework:** **Next.js 14 (App Router)**. The App Router provides a superior developer experience with its file-based routing, built-in support for React Server Components, and seamless integration with Vercel's Edge Network for global, low-latency static and dynamic rendering. This is critical for the initial app load and the responsiveness of the SOS button. Server Components allow us to fetch user and circle data at the edge, ensuring the dashboard is always fast and up-to-date without a full client-side data fetch waterfall. The App Router’s nested layout system is perfect for our two main user contexts: unauthenticated (marketing, login) and authenticated (dashboard, SOS).
*   **Backend Platform:** **Firebase Unified Platform**. Firebase is the optimal choice for a real-time, mobile-first application due to its integrated suite of services that share a common security and identity model. This integration eliminates the need for complex glue code and reduces the surface area for security bugs.
    *   **Realtime Database:** **Cloud Firestore**. Firestore is selected over Realtime Database for its more powerful querying capabilities, which will be essential for future phases, and its robust, built-in offline persistence. As per Firebase documentation, "Cloud Firestore automatically caches a copy of the data your app is actively using, so your client app can access the data whether it's online or offline" . This is our primary offline mechanism. Its document-based structure maps cleanly to our domain model (users, circles, events).
    *   **Authentication:** **Firebase Authentication**. Provides a secure, standards-based (OAuth 2.0, OpenID Connect) identity system with built-in support for email/password, Google, and other providers. Its tight integration with Firestore Security Rules is the cornerstone of our Zero-Trust model. Firebase Auth handles all the complexities of secure session management, token refresh, and credential storage.
    *   **Messaging:** **Firebase Cloud Messaging (FCM)**. FCM is the industry-standard, free push notification service. It "provides a reliable and battery-efficient connection between your server and your users' devices"  and is the backbone of our zero-cost, high-reliability notification strategy. FCM’s support for data messages is crucial, as they can be handled by our service worker even when the web app is not in the foreground.
    *   **Serverless Compute:** **Cloud Functions for Firebase (2nd Generation)**. 2nd Gen functions are a critical enabler for our 2.8-second SLA. They support **minimum instances**, a feature that "keeps functions warm to reduce cold starts" . Cold starts are the primary source of unpredictable latency in serverless architectures, and this feature allows us to guarantee a consistent, fast response time for the `triggerSOS` function. 2nd Gen also offers better observability and networking options, which are essential for a production system.

#### **B. Zero-Trust Security Model**

Security is not a feature; it is the foundation. Our model is implemented through Firestore Security Rules, which act as a server-side firewall for our data. These rules are the single source of truth for data access and are version-controlled alongside our application code.

*   **Philosophy:** All rules start with a default deny. Access is granted only if the request is from an authenticated user and the user has a specific, authorized relationship to the data in question (e.g., they are the owner of a document, or a member of a related circle). We follow the principle of least privilege to the letter.
*   **Implementation:** Rules will be written using custom functions to keep them clean, readable, and maintainable. For example:
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Helper functions for clarity
        function isSignedIn() {
          return request.auth != null;
        }
        function isOwnerOfProfile(profileId) {
          return isSignedIn() && request.auth.uid == profileId;
        }
        function getCircleIdForEvent(eventId) {
          return get(/databases/$(database)/documents/sos_events/$(eventId)).data.circle_id;
        }
        function isMemberOfCircle(circleId) {
          return isSignedIn() && exists(/databases/$(database)/documents/circles/$(circleId)/members/$(request.auth.uid));
        }
        function isMemberOfCircleForEvent(eventId) {
          return isMemberOfCircle(getCircleIdForEvent(eventId));
        }

        // A user can only read and write their own profile
        match /profiles/{profileId} {
          allow read, write: if isOwnerOfProfile(profileId);
        }

        // A user can create an SOS event. Only the owner or a circle member can read it.
        // Only the owner can update it to 'resolved'.
        match /sos_events/{eventId} {
          allow create: if isSignedIn();
          allow read: if isOwnerOfEvent(eventId) || isMemberOfCircleForEvent(eventId);
          allow update: if isOwnerOfEvent(eventId) && request.resource.data.status == 'resolved';
        }

        // A user can manage their own push subscriptions
        match /push_subscriptions/{subId} {
          allow read, write: if isSignedIn() && request.auth.uid == resource.data.user_uid;
        }
      }
    }
    ```
*   **Validation & Testing:** All rules must be developed and tested using the **Firebase Emulator Suite** before being deployed to production. This allows for safe, local testing of security logic. We will write a suite of unit tests for our rules using the `@firebase/rules-unit-testing` library to ensure every rule path is covered. A manual security audit by a third party is planned for the pre-launch phase.

#### **C. Comprehensive Abuse Prevention System**

As a public safety utility, the system must be resilient against misuse, which could lead to desensitization of responders or a complete system failure.

*   **SOS Spam / DoS Prevention:** A user is limited to 3 SOS activations per rolling hour. A fourth attempt is blocked by a Cloud Function that checks a `user_limits` document in Firestore. Upon hitting the limit, a one-hour cooldown is enforced. The `user_limits` document will track `sos_count`, `last_sos_time`, and `cooldown_expires`. This state is updated atomically using Firestore transactions to prevent race conditions.
*   **False Alarm Reduction (Pocket Dial Protection):** The client application will use the DeviceOrientation and Proximity Sensor APIs. If an activation is attempted while the device orientation is less than 15 degrees from vertical and the proximity sensor is covered (indicating the phone is in a pocket or bag), the activation is automatically canceled. This logic runs entirely on the client to avoid unnecessary server calls.
*   **Remote Lock for Incident Management:** If two or more members of a user's safety circle send a "remote lock" command, a Cloud Function will set a `remote_lock_expires` timestamp in the user's `profiles` document. The client application will check this field on load and disable the SOS button for 15 minutes if the lock is active. This feature is crucial for managing a live incident where the user may be unable to interact with their phone. The command requires consensus (≥2 members) to prevent a single malicious actor from locking a user out.

---

### **IV. Phase 1: Mission-Critical Feature Specifications**

#### **A. F1.1: SOS Activation Engine**

*   **User Experience:**
    *   The primary SOS button is a large, red, circular element with a clear label, positioned prominently in the center of the screen on the main SOS page.
    *   On press, a 3-second countdown begins with a shrinking circular progress indicator and three distinct haptic pulses (at 1s, 2s, and on release). The visual feedback is designed to be clear even in high-stress, low-visibility situations.
    *   The user can cancel the activation at any point during the hold by moving their finger away. A clear "Canceled" message is displayed.
    *   Upon successful activation, the UI transitions to an "Active SOS" state, showing a live map of the user's location (if available) and a list of circle members with their notification status (e.g., "Alert Sent," "Delivered," "Acknowledged").
*   **Silent Mode:**
    *   A toggle in the settings enables silent mode. When active, the primary button is disabled and visually grayed out.
    *   SOS can be triggered by a vigorous device shake (detected via the `devicemotion` event with a threshold of >1.5g sustained for 500ms) or by speaking the phrase "I'm okay" (using the Web Speech API's `SpeechRecognition` interface with a confidence threshold of >0.7).
    *   Silent mode activation provides no visual or audible feedback on the triggering device to maintain discretion.
*   **Backend Workflow:**
    1.  The frontend calls the `POST /api/sos/trigger` HTTP endpoint.
    2.  This request is handled by the **`triggerSOS` Cloud Function (2nd Gen)**.
    3.  The function is configured with `minInstances: 1` to ensure it is always warm, and `memory: 512MB` to handle location processing.
    4.  It validates the user's JWT, checks their `user_limits` document for spam cooldown using a Firestore transaction, and acquires the best available location (using the Geolocation API with a 5-second timeout, falling back to IP-based location if needed, with a clear `accuracy_meters` field in the event record).
    5.  It creates a new document in the `sos_events` collection with a status of `active`.
    6.  It immediately returns a `202 Accepted` HTTP status to the client, confirming the user's action. This is the moment the 2.8-second SLA is measured from (client request start to 202 response).
    7.  It publishes a message to a Pub/Sub topic (`sos-triggered`) to initiate the notification cascade asynchronously. This decoupling is essential for meeting the SLA.

#### **B. F1.2: Circle & Contact Management**

*   **Data Model:**
    *   A `circles` collection holds circle metadata (`owner_uid`, `name`, `created_at`).
    *   A `circle_members` sub-collection under each circle document tracks members (`member_uid`, `joined_at`, `status` (active, invited, left)).
    *   An `emergency_contacts` collection stores contact details linked to a user (`user_uid`, `name`, `phone`, `email`, `fcm_token`, `priority_tier` (1, 2, 3)). The `fcm_token` is the critical field.
*   **FCM-Centric Design:** The `fcm_token` field is the critical piece of data. On app initialization, the client registers with FCM and stores the resulting registration token in its own document within a `push_subscriptions` collection. This token is the sole address used for notifications, completely decoupling the system from phone numbers and SMS. The app will also handle FCM token refresh events to keep the token up-to-date in Firestore.
*   **Invite Workflow:** The user enters a contact's email or phone number. The system sends an invite link via email or SMS (this is the *only* use of SMS in the entire system, and it is for onboarding, not alerting). The invite link directs the user to the Loops signup page with a pre-filled invite code. Upon successful signup, a Cloud Function adds the new user to the inviter's circle.

#### **C. F1.3: Intelligent Notification Core**

The system employs a three-tier, sequential fallback to maximize delivery reliability across all platforms and network states. The goal is to achieve 99.6% delivery within 5 seconds.

1.  **Primary Channel: FCM Direct.** The `notifySOS` Cloud Function retrieves all active FCM tokens for the user's circle members. It sends a high-priority, data-only FCM message to each token. Data messages are preferred as they are handled by the client app's service worker even when the app is in the background or closed. The payload includes the SOS event ID, location, and a deep link to the event in the app.
2.  **Fallback 1: WebRTC Data Channel.** If the FCM message fails (as reported by the FCM API with a `NOT_FOUND` or `UNREGISTERED` error) or as a pre-emptive measure for iOS devices (where background web app notifications are notoriously unreliable), the system attempts to establish a peer-to-peer WebRTC data channel. A simple signaling server (implemented as another Cloud Function) will facilitate the connection between the triggering user's device (or a proxy) and the contact's device to send the alert directly. This is a complex but necessary fallback for iOS.
3.  **Fallback 2: Local Notification + Email.** As a final, guaranteed delivery mechanism, a local notification is displayed on the triggering user's own device with a summary of the event and instructions to call for help. Simultaneously, a plain-text email is sent via a transactional email service (e.g., SendGrid, which has a generous free tier) to any contact in the circle who has an email address on file, containing the alert message and a static Google Maps link to the last known location.
*   **iOS PWA Guidance:** The app will detect if it is running on iOS and not installed as a PWA (using the `navigator.standalone` property). If so, after the first SOS attempt, a non-dismissible modal will appear with a 3-step illustrated guide on how to "Add to Home Screen," as this is required for reliable background notifications on iOS. The app will track whether this prompt has been shown in the user's profile to avoid repeated annoyance.

#### **D. F1.4: Enterprise Offline Resilience**

*   **Primary Mechanism: Firestore Offline Persistence.** This is enabled by default in the Firebase Web SDK. All writes to Firestore (like creating an `sos_events` document) are automatically queued in a local cache and will be synced to the server when the network connection is restored. This is a battle-tested, reliable mechanism provided by the platform.
*   **Secondary Failsafe: Encrypted Local Queue.** For the absolute criticality of an SOS event, an additional queue is maintained in the browser's IndexedDB. The SOS event data (location, timestamp, circle ID) is encrypted using the Web Crypto API with AES-GCM before being stored, using a key derived from the user's Firebase UID. A service worker monitors the network state (`navigator.onLine`) and, upon detecting a reconnection, initiates a sync process using an exponential backoff retry strategy (starting at 30s, then 60s, 120s, etc.). This system is designed to achieve a 95% success rate for syncing offline SOS events within 10 minutes of network restoration. The service worker will also handle the FCM background message event to process alerts even when the main app is not running.

---

### **V. Production-Grade Technical Specifications**

#### **A. Data Model (Firestore Collections)**

*   `profiles/{uid}`: `name`, `email`, `phone`, `security_settings` (MFA status), `pwa_installed` (boolean), `remote_lock_expires` (timestamp)
*   `circles/{circle_id}`: `owner_uid`, `name`, `created_at`
*   `circles/{circle_id}/members/{member_uid}`: `joined_at`, `status` (`active`, `invited`)
*   `emergency_contacts/{contact_id}`: `user_uid`, `name`, `phone` (E.164), `email`, `fcm_token`, `priority_tier` (1, 2, 3)
*   `sos_events/{event_id}`: `user_uid`, `circle_id`, `status` (`active`, `resolved`), `location` (GeoPoint), `accuracy_meters` (number), `trigger_method` (`hold`, `shake`, `voice`), `created_at`, `resolved_at`, `resolution_reason` (`false_alarm`, `all_ok`, `emergency_handled`)
*   `push_subscriptions/{subId}`: `user_uid`, `fcm_token`, `platform` (`web`), `created_at`, `last_seen` (for presence)
*   `user_limits/{user_uid}`: `sos_count` (number), `last_sos_time` (timestamp), `cooldown_expires` (timestamp)
*   `notification_logs/{log_id}`: `event_id`, `contact_id`, `channel` (`fcm`, `webrtc`, `email`), `status` (`sent`, `delivered`, `failed`), `timestamp`, `error_message` (string)

#### **B. Core Cloud Functions**

*   **`triggerSOS` (HTTP, 2nd Gen):** The public entry point. Min instances: 1. Memory: 512MB. Timeout: 10s. This function is the most critical path in the system.
*   **`notifySOS` (Pub/Sub, 2nd Gen):** The notification worker. Memory: 512MB. Timeout: 60s. It handles the multi-channel cascade and logs all outcomes to `notification_logs`. It will use batching for FCM sends to improve efficiency.
*   **`enforceAbuseControls` (Firestore Trigger):** Listens for `onCreate` on `sos_events`. Updates the `user_limits` document for the user using a transaction, enforcing the cooldown logic. It also checks for the remote lock state.
*   **`handleInviteAcceptance` (HTTP, 2nd Gen):** Handles the invite acceptance flow, adding the new user to the circle.

#### **C. Frontend Architecture & Accessibility**

*   **Core Component:** `SOSButton.tsx` is a self-contained, accessible component built with React hooks (`useState`, `useRef`, `useCallback`). It encapsulates all the logic for the 3-second hold, haptic feedback, and cancellation.
*   **WCAG 2.1 AAA Compliance:** This is non-negotiable. The app will be fully navigable by keyboard, compatible with screen readers (VoiceOver, NVDA), and meet the highest standards for color contrast (minimum 7:1 for normal text), text spacing, and cognitive load. This includes:
    *   Using `aria-live="assertive"` regions for critical, time-sensitive status updates like "SOS Activated".
    *   Ensuring all interactive elements have a visible and clear focus state.
    *   Providing text alternatives for all non-text content.
    *   Ensuring the app is fully functional in high-contrast mode.
    *   Allowing users to extend time limits (like the 3-second hold) if needed.

---

### **VI. GitHub Repository Structure & Engineering Protocol**

The repository is structured to be self-documenting, scalable, and conducive to team collaboration. It follows the "monorepo-lite" pattern, keeping the frontend and Cloud Functions in a single repo for atomic deploys and shared type definitions.

```
loops-mvp/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Lint, type-check, unit/integration tests
│       └── e2e-performance.yml    # E2E tests + Performance SLA gates
├── .firebaserc                    # { "projects": { "default": "loops-mvp-prod", "staging": "loops-mvp-staging" } }
├── firebase.json                  # Config for Hosting, Functions, and Emulators
├── functions/
│   ├── src/
│   │   ├── http/
│   │   │   └── sos/
│   │   │       └── triggerSOS.ts   # Main HTTP trigger
│   │   ├── pubsub/
│   │   │   └── notifySOS.ts       # Notification worker
│   │   ├── triggers/
│   │   │   └── enforceAbuseControls.ts
│   │   ├── lib/
│   │   │   ├── fcmClient.ts       # Wrapper for FCM Admin SDK
│   │   │   ├── webrtcSignaler.ts  # Simple signaling logic
│   │   │   └── emailClient.ts     # Wrapper for SendGrid
│   │   └── index.ts               # Exports all functions
│   ├── package.json
│   └── tsconfig.json
├── public/
│   ├── favicon.ico
│   └── manifest.json              # PWA manifest with display: standalone
├── src/
│   ├── app/
│   │   ├── (auth)/                # Route group for protected pages
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Shows active SOS and history
│   │   │   ├── sos/
│   │   │   │   └── page.tsx       # Main SOS activation page
│   │   │   └── settings/
│   │   │       └── page.tsx       # Circle, contacts, security settings
│   │   ├── (marketing)/           # Route group for public pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── layout.tsx             # Root layout with global providers
│   │   └── providers/
│   │       ├── AuthProvider.tsx   # Wraps app with Firebase Auth context
│   │       └── FCMProvider.tsx    # Handles FCM token registration
│   ├── components/
│   │   ├── ui/
│   │   │   └── SOSButton.tsx      # The critical UI component
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── firebase/
│   │   │   └── clientApp.ts       # Firebase SDK initialization (web)
│   │   ├── security/
│   │   │   └── abuseControls.ts   # Client-side pocket dial logic
│   │   └── utils/
│   │       └── formatLocation.ts  # Helper to format GeoPoint for UI
│   ├── types/
│   │   └── index.ts               # All TypeScript interfaces (shared with functions if needed)
│   └── styles/
│       └── globals.css            # Base styles and WCAG-compliant color palette
├── tests/
│   ├── e2e/
│   │   └── sos-flow.spec.ts       # Cypress test for full SOS journey
│   ├── integration/
│   │   └── sos-engine.test.ts     # Tests the core logic with Firebase Emulator
│   └── unit/
│       └── utils.test.ts
├── firebase.rules                 # Version-controlled security rules
├── firebase.indexes.json          # Firestore indexes for queries
├── next.config.js
├── package.json
├── README.md                      # Complete setup, run, and contribution guide
└── CONTRIBUTING.md                # Code style, PR process, branching strategy
```

**Engineering Protocol:**
*   **Branching:** `main` is always production-ready. All work is done in short-lived feature branches named `feat/feature-name` or `fix/bug-name`.
*   **PR Requirements:** Every PR must include updated tests, pass all CI checks, have a clear description linking to a GitHub issue, and have at least one approval from a senior engineer.
*   **Documentation:** The `README.md` is the single source of truth for onboarding. It must be kept up-to-date and include:
    *   Prerequisites (Node.js version, Firebase CLI)
    *   Local setup steps (`.env.local` setup, `firebase emulators:start`)
    *   Commands to run the dev server, tests, and linter
    *   A link to the full PRD

---

### **VII. Quality Assurance & Launch Readiness Gates**

The CI/CD pipeline is the final, non-negotiable quality gate. It is designed to catch bugs, performance regressions, and security issues before they reach users.

#### **A. CI Pipeline (ci.yml)**
1.  **Code Quality:** `npm run lint` (ESLint) and `npm run type-check` (TypeScript).
2.  **Unit Tests:** `npm run test:unit` (Jest) for pure utility functions and helpers.
3.  **Integration Tests:** `npm run test:integration` (Jest + Firebase Emulator Suite) for testing business logic against a local, emulated Firestore and Auth instance. This includes testing the abuse control logic and security rules.

#### **B. E2E & Performance Pipeline (e2e-performance.yml)**
This pipeline runs on every push to `main` and is the gate to production deployment.
1.  **E2E Tests:** `npm run test:e2e` (Cypress) covering the core user journeys:
    *   User can sign up, create a circle, and add a contact.
    *   User can trigger an SOS and see the "Active" state.
    *   User can resolve an SOS.
    *   Offline scenario: Trigger SOS offline, go online, verify sync.
2.  **Performance Gate - Activation Speed:** A k6 script simulates 100 concurrent `POST /api/sos/trigger` requests against a staging environment. The pipeline **fails** if the 95th percentile response time exceeds 2.8 seconds. This test is the ultimate validation of our architecture.
3.  **Performance Gate - Notification Delivery:** A test suite uses mocked FCM and email clients to verify that in a scenario with 20 mock contacts, the logic correctly attempts all three fallback channels and logs the outcomes accurately. A separate, manual test on real devices validates the 99.6% target.
4.  **Offline Resilience Test:** A Cypress test uses Chrome DevTools Protocol to simulate a network outage, triggers an SOS, restores the network, and verifies the event is synced to the emulated Firestore within the 10-minute window.

---

### **VIII. Success Metrics (KPIs) for Phase 1**

These KPIs are our North Star metrics. They are directly tied to our core value proposition and will be monitored in real-time in production using Firebase Analytics and custom logging.

*   **Reliability:** Push Delivery Success Rate ≥ 99.6%. Measured by the ratio of `delivered` to `sent` events in the `notification_logs` collection.
*   **Performance:** Average SOS-to-First-Alert Time ≤ 2.8 seconds. Measured from the client-side as the time from the user pressing the button to receiving the `202 Accepted` response.
*   **Cost Efficiency:** Monthly Messaging Cost Per User = $0.00. This is a hard requirement. Any cost would invalidate our core business model.
*   **Security:** Onboarding Completion Rate (with MFA setup) ≥ 92%. This measures our success in getting users to adopt secure practices from the start.
*   **Adoption:** Weekly Active Users (in primary segment) ≥ 80%. This measures the daily utility and "stickiness" of the app for our core users.
*   **Safety Efficacy:** Silent Mode Adoption Rate (of total SOS) ≥ 15%. This validates that our trauma-informed design is being used in real-world scenarios.

---

### **IX. Conclusion**

This PRD is a complete, end-to-end blueprint for a life-critical application. It transcends a simple feature list by embedding security, performance, accessibility, and ethical considerations into its very core. By leveraging the Firebase platform to its fullest potential—using Firestore's offline capabilities, FCM's reliability, and 2nd Gen Functions' performance guarantees—we have a clear, feasible, and robust path to building a sovereign alert system that can be trusted in the most critical moments. This document, and its accompanying repository structure, provides everything an engineering team needs to ship a flawless, production-ready MVP that establishes Loops as a foundational piece of digital public infrastructure. The level of detail, from the data model to the CI/CD gates, ensures there is no ambiguity in what needs to be built, how it should be built, and how its success will be measured. This is not just a plan; it is a commitment to building a product that can save lives.