'use client';

import Link from 'next/link';
import { useAuth } from '@/app/providers/AuthProvider';
import styles from './page.module.css';

// Simple SVG icons to avoid new dependencies
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const UserPlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
);
const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);

// Mock data for display purposes - in a real app, this would come from state or props.
const trustedContacts = [
    { id: 1, name: "Jane Doe", initials: "JD" },
    { id: 2, name: "John Smith", initials: "JS" },
    { id: 3, name: "Peter Jones", initials: "PJ" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome back, {user?.displayName || 'User'}!</h1>
      </header>

      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.destructiveCard}`} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Emergency SOS</h2>
            <ShieldIcon />
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardDescription}>
              Activate an SOS to immediately alert your trusted contacts with your location.
            </p>
            <Link href="/sos" className={`${styles.button} ${styles.buttonDestructive}`}>
              Go to SOS Page
            </Link>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Trusted Contacts</h2>
            <UserPlusIcon />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{trustedContacts.length}</div>
            <p className={styles.cardSubtext}>contacts in your safety circle</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Notifications</h2>
            <BellIcon />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>0</div>
            <p className={styles.cardSubtext}>unread alerts or updates</p>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.full}`} style={{ marginTop: '1.5rem' }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Manage Your Circle</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.contactList}>
            {trustedContacts.map(contact => (
              <div key={contact.id} className={styles.contactItem}>
                <div className={styles.avatar}>{contact.initials}</div>
                <span className={styles.contactName}>{contact.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}