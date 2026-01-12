import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Check for SSR data
const initialData = (window as any).__INITIAL_DATA__;

if (initialData) {
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App initialData={initialData} />
    </React.StrictMode>
  );
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}