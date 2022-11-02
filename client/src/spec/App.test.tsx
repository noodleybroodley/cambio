import { render, screen } from '@testing-library/react';
import {describe, expect, test} from '@jest/globals'
import App from '../App';

describe('App', () => {
  it('should render app', () => {
    render(<App/>);
    expect(screen.getAllByText('Learn React').length).toEqual(1);
  })
});