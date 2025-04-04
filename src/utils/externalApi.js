import apiCache from './apiCache';

// Helper for NYTimes API
export const fetchNYTimesArticles = async (apiKey, query = 'health+medicine+wellness') => {
  if (!apiKey) {
    throw new Error('No API key provided');
  }
  
  const baseUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
  const url = `${baseUrl}?q=${query}&api-key=${apiKey}`;
  
  try {
    // Use the cache utility
    const data = await apiCache.fetchWithCache(url);
    
    if (!data.response || !data.response.docs) {
      throw new Error('Invalid API response format');
    }
    
    return data.response.docs.map(doc => ({
      id: doc._id,
      title: doc.headline.main,
      abstract: doc.abstract || doc.snippet,
      url: doc.web_url,
      publishDate: new Date(doc.pub_date).toLocaleDateString(),
      image: doc.multimedia && doc.multimedia.length > 0 
        ? `https://www.nytimes.com/${doc.multimedia[0].url}` 
        : null
    }));
  } catch (error) {
    console.error('NYTimes API error:', error);
    throw error;
  }
};

// Mock data to use as fallback
export const mockHealthArticles = [
  {
    id: "mock1",
    title: "Health Benefits of Mediterranean Diet",
    abstract: "Research suggests that following a Mediterranean diet can reduce the risk of heart disease and improve longevity.",
    url: "#",
    publishDate: "2023-03-15",
    image: "https://via.placeholder.com/150"
  },
  {
    id: "mock2",
    title: "Sleep and Mental Health Connection",
    abstract: "Studies show that quality sleep plays a crucial role in maintaining good mental health and cognitive function.",
    url: "#",
    publishDate: "2023-03-12",
    image: "https://via.placeholder.com/150"
  },
  {
    id: "mock3",
    title: "The Role of Exercise in Managing Chronic Conditions",
    abstract: "Regular physical activity can help manage symptoms of chronic diseases such as diabetes and hypertension.",
    url: "#",
    publishDate: "2023-03-08",
    image: "https://via.placeholder.com/150"
  }
];