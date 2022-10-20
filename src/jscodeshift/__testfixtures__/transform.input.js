import { mount } from 'enzyme';

import App from './App';

describe('<App />', () => {
  it('renders learn react link', () => {
    const wrapper = mount(<App />);
    expect(wrapper.find('a.App-link').text()).toBe('Learn React');
    expect(wrapper.find('a.App-link').text()).toBe('Learn React');
  });
});
