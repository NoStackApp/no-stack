import styled from 'styled-components';

export const ConsoleWrapper = styled.div`
  direction: ltr;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999999;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(0, 0, 0, 0.8);
`;

export const TextButton = styled.button`
  color: #007aff;
  font-size: 0.9rem;
  font-weight: 350;
  background: none;
  border: none;
  margin: 0 0.5em;
  padding: 0 0.2em;
  cursor: pointer;

  &:hover {
    color: #ff6961;
  }

  &:disabled {
    color: #dddddd;
    cursor: default;
  }

  &::-moz-focus-inner {
    border: 0;
  }
`;

export const HighlightedForm = styled.div`
  margin: 1em;
  padding: 1em;
  background-color: #f0ffff;
`;

export const IdText = styled.span`
  color: #c8c8c8;
  font-size: 0.8em;
  font-weight: 300;
`;
