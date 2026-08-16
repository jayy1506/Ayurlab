import { Link } from 'react-router-dom';
import { FlaskConical, BookOpen, Sparkles } from 'lucide-react';
import herbalScenery from '../assets/herbal_scenery.png';
import './Home.css';

const Home = () => {
  return (
    <div className="herbal-bg" style={{ 
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: `url(${herbalScenery})`
    }}>
      <div className="home-container">
        <div className="home-badge">
          <Sparkles size={14} /> AI-POWERED TRADITION
        </div>
        <h1 className="heading-lg home-title">Experience the <br/> Science of Nature</h1>
        <p className="text-muted home-desc">
          Enter the AI Ayurveda Virtual Lab. Experience the ancient science of life through interactive, immersive simulations.
        </p>
        
        <div className="home-actions">
          <Link to="/learning" className="btn-primary">
            <BookOpen size={20} /> Explore Learning
          </Link>
          <Link to="/practical" className="btn-outline">
            <FlaskConical size={20} /> Open Practical Lab
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
