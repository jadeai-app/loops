Title: Loops – Personal Safety Social Platform

Version: 1.0

Architecture: Firebase-only Next.js PWA with GitHub CI/CD

Author: LoopsSafety

Date: 2025-10-12



---


1. Vision and Purpose


Loops is a living digital safety ecosystem where users participate in intimate, socially accountable communities—Loops—that actively monitor personal and collective well-being. The platform redefines safety as a daily, shared practice through its central “I’m OK” dashboard button. It combines psychologically intuitive social design with technical robustness, enabling both peace of mind and real-time intervention. Loops must operate globally, offline-first, with strict privacy, security, and legal compliance, while scaling horizontally and maintaining resilience under high concurrency.



---


2. System Overview


Loops is a Next.js PWA, fully responsive, mobile-first, and offline-capable. It leverages Firebase services (Authentication, Firestore, Cloud Functions, Cloud Messaging, Hosting, Storage, Analytics, Crashlytics) and GitHub for CI/CD automation. The system ensures real-time synchronization of user states, alerts, and feed interactions, while providing modular and maintainable architecture. The platform integrates social, safety, and monitoring features in one coherent, emotionally intelligent experience.



---


3. Firebase Infrastructure


3.1 Authentication


Email/Password, Google OAuth, optional SSO


Custom claims for RBAC: Citizen, Operator, Administrator


Multi-factor authentication


Token expiration management and refresh handling



3.2 Firestore Database

Collections and schema:


users: uid, displayName, email, role, verified, lastLogin, location, loopsJoined


loops: loopId, name, description, members, admins, settings (check-in interval, privacy), engagementMetrics, geolocation bounds


posts: postId, content, mediaUrls, authorUid, loopId, timestamp, reactions, readStatus


alerts: alertId, type (check-in, emergency, custom), severity, status (pending, verified, escalated, resolved), targetUsers, createdAt, escalations


logs: eventId, actorUid, action, targetUid/loopId, timestamp, metadata



Indexes and Queries:


Composite index on loops.members + alerts.status for real-time alert feeds


Index on users.loopsJoined for personalized dashboards


Timestamp-based sorting for posts and alerts


Geospatial indexing for geofiltered notifications



3.3 Cloud Functions

Serverless logic with triggers:


onUserCheckIn: triggered when a user presses “I’m OK”; updates lastCheckIn, resets timers, and triggers FCM notification to loops


checkInMonitor: scheduled function every 5 minutes; evaluates overdue check-ins and triggers escalation sequence


broadcastAlert(alertId): triggered when alert created or escalated; sends push notifications and optional email/SMS


verifyAlert(alertId): callable function for Operators/Admins to approve or reject alerts


auditTrail(event): callable function logging all actions to logs collection



3.4 Cloud Messaging


Web push, in-browser notifications, mobile push


Escalation sequence: reminder → loop alert → emergency contact


User-level FCM tokens stored in users.fcmTokens


Topic-based messaging for loop subscriptions



3.5 Hosting and Storage


PWA served via Firebase Hosting with CDN and cache-control headers


Storage bucket for encrypted media (AES-256), supporting images, audio, short video


Signed URLs for temporary access when needed



3.6 Analytics and Crashlytics


Track check-in adherence, loop responsiveness, feed engagement, alert escalations


Optional BigQuery export for advanced longitudinal reporting


Crashlytics monitoring for front-end and Cloud Functions errors




---


4. GitHub Integration


Branching: main (production), dev (development)


Secrets: Firebase credentials, API keys


CI/CD Workflow (.github/workflows/deploy.yml):


Install Node.js dependencies


Lint, run unit/integration tests


Build Next.js PWA


Deploy Hosting, Cloud Functions, Firestore/Storage rules


Automatic release tagging and notes generation


PR approval enforcement (Maintainer + Security Auditor)


Automated labeling for issues/bugs/features





---


5. Functional Requirements


User Types:


Citizen: receives alerts, joins loops, participates in check-ins


Operator: creates/validates alerts, monitors loops, manages escalation


Administrator: manages roles, system configuration, compliance, reporting



Core Features:


Registration & secure authentication


Real-time loop creation & management


Interactive feed with posts, reactions, chat


“I’m OK” dashboard button with customizable interval and escalation logic


Alert creation, verification, broadcast


Geolocation filtering for alerts


Emergency contact integration


History of posts, alerts, loops


Push notifications & offline caching


Role-based access & permissions




---


6. Non-Functional Requirements


Availability: 99.9% uptime


Latency: <300ms for FCM notifications


Scalability: Serverless horizontal scaling for Cloud Functions and Firestore


Security: HTTPS, App Check, end-to-end encryption, RBAC


Compliance: GDPR, NZ Privacy Act


Cost: Firebase Blaze plan optimized




---


7. Front-End Design and UI/UX


Pages: /dashboard, /loops, /loop/[id], /alerts, /profile


Dashboard: pulsating “I’m OK” button (green/amber/red), streak visualizations


Loops: feed with posts, reactions, chat, presence indicators


Profile & Settings: check-in interval, alert preferences, notification settings


Zustand for real-time state sync


Framer Motion: subtle animations for feed updates, pulses, notifications


Accessibility: ARIA labels, haptic feedback, high-contrast themes


Offline-first PWA support




---


8. API and Cloud Function Endpoints


POST /checkin: triggers onUserCheckIn


POST /alerts/create: triggers broadcastAlert


POST /alerts/verify: triggers verifyAlert


GET /loops/:id/feed: returns posts sorted by timestamp


GET /users/:uid/status: returns last check-in, loop memberships, alerts


GET /analytics/summary: returns loop responsiveness, streaks, alerts




---


9. Database Design and Security


Firestore Security Rules:


users read/write only by self or Admin


loops read/write by members or Admin


alerts write by Operators/Admins, read by members


logs read/write by Admin only



Indexed queries for feed, alerts, loops


AES-256 encryption for stored media




---


10. CI/CD and Deployment


GitHub Actions: lint, test, build, deploy


Deploy Hosting, Functions, Firestore rules, Storage rules


Environment separation: dev, staging, prod


Secret management for Firebase keys


Automatic PR validation and release tagging




---


11. Analytics and Monitoring


Engagement tracking: check-ins, feed interactions, alert responses


Crashlytics: front-end & Cloud Function error tracking


BigQuery integration for advanced reporting


Performance monitoring for PWA and API latency




---


12. Security, Compliance, and Resilience


End-to-end encrypted messages & alerts


AES-256 for storage


HTTPS, App Check


Firestore RBAC and Cloud Function access validation


Automated daily backups


GDPR and NZ Privacy Act compliance




---


13. Future Roadmap


Multi-language support


AI anomaly detection


Global scaling and hybrid database redundancy


Federated clusters for regional compliance


Transparency dashboards