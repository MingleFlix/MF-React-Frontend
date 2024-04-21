import HeroSection from '../components/layout/heroSection/HeroSection.tsx';

export function HomePage() {
  return (
    <div>
      <HeroSection />
      <section id='about' style={{ padding: '20px 50px' }}>
        <h2>About MingleFlix</h2>
        <p>
          MingleFlix lets you create ephemeral rooms to watch videos with
          friends in real-time. Enjoy e2e encrypted chat and a shared viewing
          experience from anywhere!
        </p>
      </section>
    </div>
  );
}
