import React from 'react';
import styled from 'styled-components';

import { Source } from '../types';

const Wrapper = styled.div`
  position: relative;
`;

const SourceDiv = styled.div`
  position: absolute;
  left: 5px;
  top: 0;
  padding: 10px;
  border-radius: 5px;
  background-color: #fffdfd;
  box-shadow: 5px 5px 20px #464646;
  z-index: 999999;
  min-width: 480px;
`;

const ContentRow = styled.div`
  padding: 10px;
  margin: 10px;
  border-radius: 3px;
  background-color: #e6e0e0;
`;

interface SourceInfoTreeInterface {
  unit: Source;
}

const SourceInfoTree: React.FunctionComponent<SourceInfoTreeInterface> = ({
  unit,
  children,
}): JSX.Element =>
  unit && (
    <Wrapper>
      <SourceDiv>
        <div>Unit: {unit.name || 'Unnamed Source'}</div>
        <div>Unit ID: {unit.id}</div>
        <ContentRow>{children}</ContentRow>
      </SourceDiv>
    </Wrapper>
  );

export default SourceInfoTree;
