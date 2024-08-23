import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the Home Page!</p>
      <Link to="/about">
        <button>Go to About Page</button>
      </Link>
    </div>
  );
};

export default Home;
