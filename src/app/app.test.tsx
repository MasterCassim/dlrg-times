import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './app.component';

test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/starter by/i);
    expect(linkElement).toBeInTheDocument();
});
