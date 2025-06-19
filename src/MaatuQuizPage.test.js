import { render, screen } from '@testing-library/react';
import MaatuQuizPage from './MaatuQuizPage';

test('renders learn react link', () => {
  render(<MaatuQuizPage />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
