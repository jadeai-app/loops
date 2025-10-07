import Link from 'next/link';
import styles from './page.module.css';

// A simple CheckCircle icon component to avoid adding a new dependency
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: 'var(--primary)' }}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function MarketingPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <div className={`${styles.container} ${styles.hero}`}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Your Sovereign Safety Net</h1>
              <p className={styles.heroDescription}>
                Loops is a zero-cost, life-critical alert system that connects you to your trusted circle when it matters most.
              </p>
              <div className={styles.heroButtons}>
                <Link href="/signup" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Get Started for Free
                </Link>
                <Link href="/learn-more" className={`${styles.button} ${styles.buttonOutline}`}>
                  Learn More
                </Link>
              </div>
            </div>
            <div className={styles.heroImageContainer}>
              <div className={styles.heroImage}>App Screenshot/Graphic</div>
            </div>
          </div>
        </section>

        <section id="features" className={`${styles.section} ${styles.secondary}`}>
          <div className={`${styles.container} ${styles.features}`}>
            <div className={styles.featuresHeader}>
              <div className={styles.tagline}>Key Features</div>
              <h2 className={styles.heroTitle}>Peace of Mind, Simplified</h2>
              <p className={styles.heroDescription}>
                We focus on reliability and ease of use, so you can focus on what's important.
              </p>
            </div>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <h3>
                  <CheckCircleIcon />
                  Instant SOS Alerts
                </h3>
                <p>
                  Trigger an SOS with a single tap, instantly notifying your entire trusted circle with your location.
                </p>
              </div>
              <div className={styles.featureCard}>
                <h3>
                  <CheckCircleIcon />
                  Trusted Circles
                </h3>
                <p>
                  Build a private network of contacts who will be there for you in an emergency. You control your data.
                </p>
              </div>
              <div className={styles.featureCard}>
                <h3>
                  <CheckCircleIcon />
                  Zero-Cost, Zero-Ads
                </h3>
                <p>
                  Essential safety should be free. Loops is committed to being a 100% free, ad-free service.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`${styles.container} ${styles.cta}`}>
            <h2 className={styles.heroTitle}>Ready to Build Your Safety Net?</h2>
            <p className={styles.heroDescription}>
              Create your account today and experience the peace of mind that comes with being connected.
            </p>
            <div className={styles.ctaButton}>
              <Link href="/signup" className={`${styles.button} ${styles.buttonPrimary}`}>
                Sign Up Now
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}