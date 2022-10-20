import { render } from '@testing-library/react';

import App from './App';

describe('<App />', () => {
  it('renders learn react link', () => {
    const wrapper = render(<App />);
    expect(wrapper.find('a.App-link').text()).toBe('Learn React');
  });
});
