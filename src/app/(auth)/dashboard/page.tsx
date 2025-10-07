'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { clientDb } from '../../../lib/firebase/clientApp';
import { useAuth } from '../providers/AuthProvider';
import { SosEvent } from '../../../types';

/**
 * A real-time dashboard to display a user's active and past SOS events.
 * This component is protected by the AuthLayout and uses the useAuth hook
 * to get the current user's data.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<SosEvent | null>(null);
  const [pastEvents, setPastEvents] = useState<SosEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const eventsCollection = collection(clientDb, 'sos_events');
    const q = query(
      eventsCollection,
      where('user_uid', '==', user.uid),
      orderBy('created_at', 'desc'),
      limit(20) // Limit to the last 20 events for performance
    );

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const allEvents: SosEvent[] = [];
        querySnapshot.forEach((doc) => {
          allEvents.push({ id: doc.id, ...doc.data() } as SosEvent);
        });

        // Find the active event (if any)
        const currentActiveEvent = allEvents.find(event => event.status === 'active') || null;
        setActiveEvent(currentActiveEvent);

        // Filter for past (resolved) events
        const resolvedEvents = allEvents.filter(event => event.status === 'resolved');
        setPastEvents(resolvedEvents);

        setLoading(false);
      },
      (err) => {
        console.error("Error fetching SOS events:", err);
        setError("Failed to load SOS history. Please try again later.");
        setLoading(false);
      }
    );

    // Cleanup the listener when the component unmounts or the user changes
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <main><p>Loading Dashboard...</p></main>;
  }

  if (error) {
    return <main><p style={{ color: 'red' }}>{error}</p></main>;
  }

  const StaticMap = ({ event }: { event: SosEvent }) => {
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${event.location.latitude},${event.location.longitude}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7Clabel:S%7C${event.location.latitude},${event.location.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    return <img src={mapUrl} alt="Map showing last known location" style={{ maxWidth: '100%', borderRadius: '8px' }} />;
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>SOS Dashboard</h1>

      {/* Active SOS Section */}
      <section aria-labelledby="active-sos-heading">
        <h2 id="active-sos-heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Active SOS</h2>
        {activeEvent ? (
          <div style={{ border: '2px solid #DC2626', padding: '1.5rem', borderRadius: '8px' }}>
            <p><strong>Status:</strong> <span style={{ color: '#DC2626' }}>ACTIVE</span></p>
            <p><strong>Triggered At:</strong> {new Date(activeEvent.created_at.seconds * 1000).toLocaleString()}</p>
            <div style={{ marginTop: '1rem' }}>
              <StaticMap event={activeEvent} />
            </div>
            {/* TODO: Add a button to resolve the SOS */}
          </div>
        ) : (
          <p>No active SOS events.</p>
        )}
      </section>

      {/* Past SOS Events Section */}
      <section aria-labelledby="past-sos-heading" style={{ marginTop: '2.5rem' }}>
        <h2 id="past-sos-heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Event History</h2>
        {pastEvents.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {pastEvents.map(event => (
              <li key={event.id} style={{ border: '1px solid #E5E7EB', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p><strong>Status:</strong> {event.status} {event.resolution_reason && `(${event.resolution_reason})`}</p>
                <p><strong>Date:</strong> {new Date(event.created_at.seconds * 1000).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No past SOS events found.</p>
        )}
      </section>
    </main>
  );
}

// Add an 'id' property to the SosEvent interface for local use
declare module '../../../types' {
    interface SosEvent {
        id?: string;
    }
}