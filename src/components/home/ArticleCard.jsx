import React from 'react';

const ArticleCard = ({ article }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <img 
        src={article.image} 
        alt={article.title} 
        className="w-full h-40 object-cover rounded-t-lg"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80";
        }}
      />
      <div className="p-4">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mb-2 ${
          article.category === 'Health' ? 'bg-blue-100 text-blue-800' :
          article.category === 'Science' ? 'bg-green-100 text-green-800' :
          article.category === 'Mental Health' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {article.category || 'Health'}
        </span>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{article.title || 'Article Title'}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {article.abstract || 'Article description goes here...'}
        </p>
        <a 
          href={article.url || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          Read More →
        </a>
      </div>
    </div>
  );
};

export default ArticleCard;