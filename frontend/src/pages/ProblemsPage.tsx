import React from 'react';
import ProblemList from '../components/problems/ProblemList';

const ProblemsPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Problems</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sharpen your coding skills with our curated collection of programming challenges.
        </p>
      </div>
      <ProblemList />
    </div>
  );
};

export default ProblemsPage;