# Email Templates

This directory contains the HTML source code for all transactional emails sent by the Loops application.

## How to Use

The email templates are loaded and populated by the `emailClient.ts` library, which is used by various Cloud Functions.

### Special Case: Password Reset Email

The **Password Reset** email is an exception. It is not sent by our Cloud Functions but directly by Firebase Authentication. To ensure a consistent brand experience, you must manually update the template in the Firebase Console using the `passwordReset.html` file in this directory.

#### Configuration Steps:

1.  **Open the Firebase Console:** Navigate to your project.
2.  **Go to Authentication:** In the left-hand menu, click on "Authentication".
3.  **Select the "Templates" Tab:** Find and click on the "Templates" tab at the top of the Authentication section.
4.  **Choose "Password reset":** In the list of email templates, click on "Password reset" to open the editor.
5.  **Update the Subject:** Set the subject line to: `Reset Your Loops Password`
6.  **Update the Email Content:**
    *   Open the `passwordReset.html` file from this directory in a text editor.
    *   Copy the **entire content** of the file.
    *   In the Firebase Console's template editor, click the `<>` (Edit HTML) button.
    *   Delete the existing default HTML and paste the content you just copied. The template is already configured to use the correct `%LINK%` placeholder.
7.  **Save the Template:** Click the "Save" button at the bottom of the editor.

By following these steps, the password reset email sent by Firebase will have the same beautiful, streamlined design as all other application emails. Remember to apply this template to all your Firebase environments (development, staging, production).