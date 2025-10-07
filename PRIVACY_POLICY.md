# Privacy Policy for the Loops Application

**Last Updated:** October 7, 2025

Your privacy is critically important to us. This Privacy Policy outlines the types of information we collect, how it is used and protected, and your rights regarding your data.

## 1. What Information We Collect

We adhere to the principle of data minimization, collecting only the data that is absolutely necessary to provide the Loops emergency alert service.

### a. Information You Provide Directly

*   **Account Information:** When you create an account, we collect your `name`, `email`, and optionally, your `phone number`. This is used for identification and communication.
*   **Emergency Contacts:** You provide the `name`, `email`, and/or `phone number` of the people in your safety circle. This information is used solely to send them alerts when you trigger an SOS.
*   **Security Information:** We store settings related to your account's security, such as whether you have enabled Multi-Factor Authentication (MFA).

### b. Information Collected Automatically When You Use the Service

*   **SOS Event Data:** When you trigger an SOS, we collect your device's `location` (latitude and longitude), the `accuracy` of that location, the `time` of the event, and the `method` of activation (e.g., button hold). This is the core information sent to your safety circle.
*   **Push Notification Tokens:** To send alerts, we use Firebase Cloud Messaging (FCM). We store your FCM `token`, which is a unique identifier for your device that allows us to send you push notifications. We do not have access to your device's underlying information.
*   **Usage Data for Abuse Prevention:** To protect the integrity of the service, we temporarily track the number of SOS events you trigger within a given time frame.
*   **Signaling Data:** For direct communication channels (WebRTC), we temporarily store signaling data for a few minutes to establish a connection between you and your circle members. This data is deleted automatically after the connection is established or fails.

## 2. How We Use Your Information

Your data is used exclusively for the following purposes:

*   **To Provide the Core Service:** To send emergency alerts containing your name, location, and the time of the event to your designated safety circle.
*   **To Secure Your Account:** To authenticate you and protect your account from unauthorized access.
*   **To Communicate With You:** To send you important information about your account or the service.
*   **To Prevent Abuse:** To ensure the service remains reliable and available for all users.

**We will never sell your data or use it for marketing or advertising purposes.**

## 3. How We Share Your Information

We only share your information in the context of an active SOS event, and only with the emergency contacts you have designated. We do not share your data with any other third parties, except for the service providers essential for our operations:

*   **Google Firebase:** We use Firebase for our backend infrastructure, including Authentication, Firestore database, Cloud Functions, and Firebase Cloud Messaging (FCM) for push notifications.
*   **SendGrid:** We use SendGrid as a fallback to send email notifications to your emergency contacts if push notifications fail.

## 4. Data Retention and Deletion

We believe in storing your data for the shortest possible time.

*   **SOS Events** are retained for **30 days** for your review and for auditing purposes.
*   **Notification Logs** are retained for **7 days** for debugging and system monitoring.
*   **Signaling Data** is retained for only **5 minutes**.

You have the **right to be forgotten**. You can request the complete and permanent deletion of your account and all associated personal data from your account settings at any time. This process will remove all of your personal information and anonymize any remaining operational data. For more details, see our [Data Retention Policy](PRIVACY.md).

## 5. Security

We take the security of your data very seriously. All communication with our servers is encrypted using TLS (HTTPS). We follow industry best practices to protect your data from unauthorized access, disclosure, alteration, or destruction.

## 6. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.

## 7. Contact Us

If you have any questions about this Privacy Policy, please contact us at [privacy@loops.app](mailto:privacy@loops.app).