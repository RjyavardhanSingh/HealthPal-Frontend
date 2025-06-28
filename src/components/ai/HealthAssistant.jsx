import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ragService from '../../services/ragService';

const HealthAssistant = () => {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message to chat
    const userMessage = { text: query, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setQuery('');
    setIsLoading(true);
    
    try {
      // Get user context to personalize responses
      const userContext = {
        role: currentUser.role,
        conditions: currentUser.medicalHistory?.chronicConditions || [],
        medications: currentUser.medicalHistory?.medications?.map(med => med.name) || []
      };
      
      // Call RAG service
      const response = await ragService.askHealthQuestion(query, userContext);
      
      // Add AI response to chat
      const aiMessage = { 
        text: response.answer, 
        sender: 'assistant',
        sources: response.sources || []
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Add error message
      const errorMessage = { 
        text: 'Sorry, I encountered an error while processing your question. Please try again.', 
        sender: 'assistant', 
        isError: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-lg shadow-md">
      <div className="bg-blue-600 text-white py-3 px-4 rounded-t-lg">
        <h2 className="text-lg font-medium">HealthPal Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Ask me any health-related questions!</p>
            <p className="text-sm mt-2">For example:</p>
            <ul className="text-sm mt-1 space-y-1">
              <li>"What are common side effects of ibuprofen?"</li>
              <li>"How can I manage my diabetes better?"</li>
              <li>"What should I know about my upcoming colonoscopy?"</li>
            </ul>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : msg.isError 
                      ? 'bg-red-100 text-red-800 rounded-bl-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300 text-xs">
                    <p className="font-semibold">Sources:</p>
                    <ul className="list-disc pl-4 mt-1">
                      {msg.sources.map((source, idx) => (
                        <li key={idx}>
                          {source.link ? (
                            <a href={source.link} className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">
                              {source.title}
                            </a>
                          ) : (
                            source.title
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 rounded-bl-none">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a health question..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-blue-600 text-white rounded-full px-4 py-2 focus:outline-none hover:bg-blue-700 disabled:bg-blue-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthAssistant;