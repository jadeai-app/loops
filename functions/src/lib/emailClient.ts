import * as sgMail from '@sendgrid/mail';
import * as logger from 'firebase-functions/logger';
import * as fs from 'fs';
import * as path from 'path';
import type { GeoPoint, Timestamp } from 'firebase-admin/firestore';

// --- Configuration ---
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  logger.warn('SENDGRID_API_KEY is not set. Email notifications will be disabled.');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@loops.app';
const APP_URL = process.env.APP_URL || 'https://loops.app'; // Default URL

// --- Template Loader ---
/**
 * Reads an HTML email template from the filesystem and populates it with data.
 * @param {string} templateName The name of the template file (e.g., 'welcome.html').
 * @param {Record<string, string>} data The data to inject into the template.
 * @returns {string} The populated HTML content.
 */
const loadTemplate = (templateName: string, data: Record<string, string>): string => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', templateName);
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Inject data into the template
    for (const key in data) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key]);
    }

    // Add common data
    html = html.replace(/{{appUrl}}/g, APP_URL);
    html = html.replace(/{{currentYear}}/g, new Date().getFullYear().toString());

    return html;
  } catch (error) {
    logger.error(`Failed to load or populate email template: ${templateName}`, error);
    throw new Error(`Could not load template ${templateName}`);
  }
};

// --- Core Email Sending Function ---
/**
 * Sends an email using a specified HTML template.
 * @param {string} to The recipient's email address.
 * @param {string} subject The email subject.
 * @param {string} templateName The name of the HTML template file.
 * @param {Record<string, string>} templateData The dynamic data for the template.
 */
const sendTemplatedEmail = async (to: string, subject: string, templateName: string, templateData: Record<string, string>) => {
  if (!process.env.SENDGRID_API_KEY) {
    logger.error(`Cannot send email to ${to} because SENDGRID_API_KEY is not configured.`);
    return;
  }

  try {
    const html = loadTemplate(templateName, templateData);
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      html,
    };
    await sgMail.send(msg);
    logger.info(`Email "${subject}" sent successfully to ${to}.`);
  } catch (error) {
    logger.error(`Failed to send email "${subject}" to ${to}`, error);
  }
};

// --- Type Definitions for Email Data ---
interface WelcomeEmailData {
  userName: string;
}

interface CircleInviteEmailData {
  inviterName: string;
  inviteLink: string;
}

interface SosAlertEmailData {
  userName: string;
  location: GeoPoint;
  timestamp: Timestamp;
}

interface SosResolutionEmailData {
  userName: string;
  eventTime: string;
  resolutionTime: string;
  resolutionReason: string;
}

// --- Exported Email Functions ---

/**
 * Sends a welcome email to a new user.
 * @param {string} to Recipient's email.
 * @param {WelcomeEmailData} data Data for the template.
 */
export const sendWelcomeEmail = (to: string, data: WelcomeEmailData) => {
  return sendTemplatedEmail(to, 'Welcome to Loops!', 'welcome.html', data);
};

/**
 * Sends a circle invitation email.
 * @param {string} to Recipient's email.
 * @param {CircleInviteEmailData} data Data for the template.
 */
export const sendCircleInviteEmail = (to: string, data: CircleInviteEmailData) => {
  return sendTemplatedEmail(to, `You're invited to join ${data.inviterName}'s safety circle`, 'circleInvitation.html', data);
};

/**
 * Sends a high-priority SOS alert email.
 * @param {string} to Recipient's email.
 * @param {SosAlertEmailData} data Data for the template.
 */
export const sendSosAlertEmail = (to: string, data: SosAlertEmailData) => {
  const mapLink = `https://www.google.com/maps?q=${data.location.latitude},${data.location.longitude}`;
  const eventTime = data.timestamp.toDate().toLocaleString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  return sendTemplatedEmail(to, `URGENT: SOS Alert from ${data.userName}`, 'sosAlert.html', {
    userName: data.userName,
    eventTime,
    mapLink,
  });
};

/**
 * Sends an email confirming an SOS alert has been resolved.
 * @param {string} to Recipient's email.
 * @param {SosResolutionEmailData} data Data for the template.
 */
export const sendSosResolutionEmail = (to: string, data: SosResolutionEmailData) => {
  return sendTemplatedEmail(to, `Update: SOS from ${data.userName} is Resolved`, 'sosResolution.html', data);
};