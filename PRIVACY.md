# Privacy and Data Retention Policy

This document outlines the data retention policies for the Loops application, designed to align with data minimization principles and respect user privacy.

## Data Retention Philosophy

We only store user data for the minimum time necessary to provide the core functionality of the Loops service, for safety auditing, and for abuse prevention. We are committed to automatically deleting data that is no longer required for these purposes.

## Automated Data Retention via TTL

We use Firestore's Time-to-Live (TTL) feature to automatically delete documents from our database after a certain period. This is a server-side process that ensures data is purged without manual intervention.

The following data retention periods are currently in effect:

| Data Collection       | Retention Period | Purpose                                                                 |
| --------------------- | ---------------- | ----------------------------------------------------------------------- |
| `sos_events`          | 30 days          | Allows users to review recent emergency events and for internal auditing. |
| `notification_logs`   | 7 days           | Used for short-term debugging and monitoring of notification delivery.  |
| `webrtc_signals`      | 5 minutes        | Contains temporary signaling data for establishing peer-to-peer calls.  |

## User Data Deletion

In addition to these automated policies, users have the "right to be forgotten" and can request the complete deletion and anonymization of their data at any time. This process is handled by the `deleteUserData` function and can be initiated from the user's account settings.

For more details on the data we collect and how we use it, please see our full [Privacy Policy](PRIVACY_POLICY.md).