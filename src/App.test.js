import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-router-dom for Jest environment
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => <div>{element}</div>,
  Navigate: () => <div>Navigate</div>,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  NavLink: ({ children, to }) => <a href={to}>{children}</a>,
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => jest.fn(),
}));

import App from './App';

describe('App Root and Navigation', () => {
  test('renders Patch Portal branding and navigation items', () => {
    render(<App />);
    expect(screen.getAllByText(/Patch/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Static Content/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/User UI View/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Sign In|Login/i).length).toBeGreaterThanOrEqual(1);
  });
});
