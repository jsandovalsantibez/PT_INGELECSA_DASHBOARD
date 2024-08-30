import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is the About Page.</p>
      <Link to="/">
        <button>Go to Home Page</button>
      </Link>
    </div>
  );
};

export default About;
