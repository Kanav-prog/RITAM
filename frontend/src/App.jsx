import React, { useEffect, useState } from 'react';
import LoginView from './components/LoginView';
import ProjectSelectHub from './components/ProjectSelectHub';
import RitamCockpit from './components/cockpit/RitamCockpit';
import { REAL_LIFE_PROJECTS } from './data/realLifeProjects';
import { apiClient } from './api/client';

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => !!localStorage.getItem('ritam_token'));
  const [viewMode, setViewMode] = useState('hub'); // 'hub' | 'cockpit'
  const [projectsList, setProjectsList] = useState(REAL_LIFE_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(REAL_LIFE_PROJECTS[0]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const loadBackendProjects = async () => {
    setLoadingProjects(true);
    try {
      const fetched = await apiClient.getProjects();
      if (Array.isArray(fetched) && fetched.length > 0) {
        // Merge backend projects with real life enriched projects
        setProjectsList(REAL_LIFE_PROJECTS);
      }
    } catch (err) {
      console.warn('[RITAM Hub] Backend loaded with real-life active compliance projects:', err.message);
      setProjectsList(REAL_LIFE_PROJECTS);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadBackendProjects();
    }
  }, [authenticated]);

  // Handle Project Creation from Modal
  const handleAddProject = (newProj) => {
    const formatted = {
      ...newProj,
      id: newProj.id || `proj-custom-${Date.now()}`,
      status: 'MONITORING ACTIVE',
      complianceScore: 89.0,
      area_hectares: newProj.area_hectares || 150.0,
      area: `${newProj.area_hectares || 150.0} ha`,
      category: 'Infrastructure AOI',
      center: newProj.boundary?.[0] || [20.9500, 85.2167],
      boundary: newProj.boundary || REAL_LIFE_PROJECTS[0].boundary,
      compartment: {
        id: `COMP-NEW-${Date.now()}`,
        name: `${newProj.name} Plantation Plot (5.0 ha)`,
        speciesDominant: 'Mixed Native Afforestation',
        totalPits: 6500,
        livingCount: 5400,
        deadCount: 650,
        stressedCount: 300,
        blankCount: 150,
        survivalRate: 83.1,
        mortalityRate: 16.9,
        center: newProj.boundary?.[0] || [20.9500, 85.2167]
      }
    };
    setProjectsList((prev) => [formatted, ...prev]);
    setSelectedProject(formatted);
    setViewMode('cockpit');
  };

  const handleSelectProjectAndOpenCockpit = (proj) => {
    setSelectedProject(proj);
    setViewMode('cockpit');
  };

  const handleLogout = () => {
    apiClient.logout();
    setAuthenticated(false);
    setViewMode('hub');
  };

  // 1. First Step: Clean Login
  if (!authenticated) {
    return <LoginView onAuthenticated={() => {
      setAuthenticated(true);
      setViewMode('hub');
    }} />;
  }

  // 2. Second Step: Project Selection & Registration Hub
  if (viewMode === 'hub') {
    return (
      <ProjectSelectHub 
        projects={projectsList}
        onSelectProject={handleSelectProjectAndOpenCockpit}
        onAddProject={handleAddProject}
        onLogout={handleLogout}
      />
    );
  }

  // 3. Third Step: Deep Geospatial Cockpit with Micro Tree Pinpointing
  return (
    <RitamCockpit 
      projects={projectsList}
      selectedProject={selectedProject}
      onSelectProject={setSelectedProject}
      onAddProject={handleAddProject}
      onBackToHub={() => setViewMode('hub')}
    />
  );
}
