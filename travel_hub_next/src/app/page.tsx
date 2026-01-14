import Link from 'next/link';
import styles from './home.module.css';

const destinations = [
  { id: 1, name: 'Paris, France', image: '/images/paris.png', description: 'Experience the city of love.' },
  { id: 2, name: 'Bali, Indonesia', image: '/images/bali.png', description: 'Tropical paradise awaits.' },
  { id: 3, name: 'Kyoto, Japan', image: '/images/kyoto.png', description: 'Discover ancient traditions.' },
];

export default function Home() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Wanderlust Awaits</h1>
          <p className={styles.subtitle}>Discover the world's most breathtaking destinations.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/auth/signup" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
              Start Journey
            </Link>
            <Link href="/partner/login" className="btn" style={{ fontSize: '1.2rem', padding: '1rem 2rem', background: 'white', color: 'black' }}>
              Partner Login
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.destinations}>
        <h2 className={styles.sectionTitle}>Popular Destinations</h2>
        <div className={styles.grid}>
          {destinations.map((dest) => (
            <div key={dest.id} className={styles.card}>
              <img src={dest.image} alt={dest.name} className={styles.cardImage} />
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{dest.name}</h3>
                <p className={styles.cardData}>{dest.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
