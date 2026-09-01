// RITAM Geospatial Environmental API Client

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = {
  // Projects
  async getProjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('Backend API connection warning (getProjects), using localized cache:', err.message);
      return null;
    }
  },

  async createProject(projectData) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('Failed to create project via API:', err);
      throw err;
    }
  },

  // Change Events & Monitoring
  async getChangeEvents(projectId = null) {
    try {
      const url = projectId ? `${API_BASE_URL}/monitoring/?project_id=${projectId}` : `${API_BASE_URL}/monitoring/`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('Backend API connection warning (getChangeEvents):', err.message);
      return null;
    }
  },

  async reviewChangeEvent(changeId, decision) {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/${changeId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('Failed to review change event:', err);
      throw err;
    }
  },

  // Field Verification & Tree Identity
  async recordTree(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/field/trees/record`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('Failed to record tree via field API:', err);
      throw err;
    }
  },

  async verifyTree(tag) {
    try {
      const response = await fetch(`${API_BASE_URL}/field/trees/${tag}/verify`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('Failed to verify tree:', err);
      throw err;
    }
  },

  // Compliance Matrix
  async getCompliance(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/compliance/${projectId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('Backend API connection warning (getCompliance):', err.message);
      return null;
    }
  }
};
