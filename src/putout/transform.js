export const report = () => 'migrate Enzyme.mount to RTL.render';

export const replace = () => ({
  "import { mount } from 'enzyme'": "import { render } from '@testing-library/react'",
});
