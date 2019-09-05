import React, { FormEvent } from 'react';
import styled from 'styled-components';

const Select = styled.select`
  background: transparent;
  border: none;
  font-size: 14px;
  height: 29px;
  width: 268px;
  padding: 5px;
  margin-left: 10px;
  background: url(https://cdn1.iconfinder.com/data/icons/cc_mono_icon_set/blacks/16x16/br_down.png)
    no-repeat right #ddd;
  background-position-x: 244px;
  background-color: #3b8ec2;
  border-radius: 5px;
  appearance: none;
`;

export interface Option {
  id: string;
  name: string;
}

export interface DropdownProps {
  options?: Option[];
  onSelect: (e: FormEvent<HTMLSelectElement>) => void;
  disabled: boolean;
}

const Dropdown = ({
  options = [],
  onSelect,
  disabled = false,
}: DropdownProps): JSX.Element => (
  <Select onChange={onSelect} disabled={disabled}>
    <option value={undefined} />
    {options.map(
      (option): JSX.Element => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ),
    )}
  </Select>
);

export default Dropdown;
