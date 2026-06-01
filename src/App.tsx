import React from 'react';
import { WorkspaceProvider, useWorkspace } from './WorkspaceContext';
import Shell from './components/Shell';
import SetupGate from './components/SetupGate';
import Landing from './components/Landing';
import { ErrorBoundary } from './components/ErrorBoundary';

function WorkspaceLayout() {
  const { isSetupComplete, hasSeenLanding } = useWorkspace();

  if (!isSetupComplete && !hasSeenLanding) {
    return <Landing />;
  }
  if (!isSetupComplete) {
    return <SetupGate />;
  }
  return <Shell />;
}

function App() {
  return (
    <ErrorBoundary>
      <WorkspaceProvider>
        <WorkspaceLayout />
      </WorkspaceProvider>
    </ErrorBoundary>
  );
}

export default App;
