import { render, screen } from '@testing-library/react';

import App from './App';

describe('<App />', () => {
  it('renders learn react link', () => {
    render(<App />);
    expect(wrapper.find('a.App-link').text()).toBe('Learn React');
    expect(
      screen.getByRole('link', {
        name: 'Learn React',
      })
    ).toBeInTheDocument();
  });
});
