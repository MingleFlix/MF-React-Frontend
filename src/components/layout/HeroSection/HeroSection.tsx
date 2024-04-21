import React from 'react';

const HeroSection: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#282c34', color: 'white' }}>
            <h2>Watch Videos Together</h2>
            <p>Create your room, invite friends, and watch videos in sync.</p>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Get Started</button>
        </div>
    );
};

export default HeroSection;