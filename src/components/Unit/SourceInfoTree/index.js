import React from 'react';
import styled from 'styled-components';

import SourceTypeTree from '../SourceTypeTree';
import SourceControlPanel from '../SourceControlPanel';

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

const SourceInfoTree = ({ source }) =>
  source && (
    <Wrapper>
      <SourceDiv>
        <div>Source: {source.name || 'Unnamed Source'}</div>
        <div>Source ID: {source.id}</div>
        <ContentRow>
          <SourceTypeTree source={source} />
        </ContentRow>
        <SourceControlPanel source={source} ContentRow={ContentRow} />
      </SourceDiv>
    </Wrapper>
  );

export default SourceInfoTree;
