import api from './api';

const ragService = {
  // Ask a health-related question
  async askHealthQuestion(query, userContext = {}) {
    try {
      const response = await api.post('/ai/health-assistant', {
        query,
        context: userContext
      });
      return response.data;
    } catch (error) {
      console.error('Error querying health assistant:', error);
      throw error;
    }
  },
  
  // Get personalized insights based on user's medical records
  async getPersonalizedInsights(patientId) {
    try {
      const response = await api.get(`/ai/insights/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting insights:', error);
      throw error;
    }
  },
  
  // Get detailed medication information
  async getMedicationInfo(medicationName) {
    try {
      const response = await api.get(`/ai/medication-info`, {
        params: { medication: medicationName }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting medication info:', error);
      throw error;
    }
  }
};

export default ragService;