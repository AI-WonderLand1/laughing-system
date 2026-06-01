import React from 'react';
import { WorkspaceProvider, useWorkspace } from './WorkspaceContext';
import Shell from './components/Shell';
import SetupGate from './components/SetupGate';
import { ErrorBoundary } from './components/ErrorBoundary';

function WorkspaceLayout() {
  const { isSetupComplete } = useWorkspace();

  return isSetupComplete ? <Shell /> : <SetupGate />;
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
