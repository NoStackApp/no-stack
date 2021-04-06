import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { Query } from '@apollo/react-components';
import styled from 'styled-components';

import { SOURCE_QUERY } from '../queries';
import { Source } from '../types';

const Button = styled.button`
  box-sizing: border-box;
  background-color: white;
  color: red;
  font-size: 16px;
  border: 1px dashed red;
  width: 25px;
  height: 25px;
  padding: 0;
  margin: 0;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
`;

const Wrapper = styled.div`
  direction: ltr;
`;

interface PopupInterface {
  id: string;
  children: (props: { unit: Source }) => JSX.Element | null;
}

const Popup: React.FunctionComponent<PopupInterface> = ({
  id,
  children,
}): JSX.Element => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const toggleTree = (): void => setIsVisible(!isVisible);

  const handleClickOutside = (event: MouseEvent): void => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Element)
    ) {
      setIsVisible(false);
    }
  };

  useEffect((): (() => void) => {
    window.addEventListener(
      'mousedown',
      (handleClickOutside as unknown) as EventListener,
      false,
    );

    return (): void => {
      window.removeEventListener(
        'mousedown',
        (handleClickOutside as unknown) as EventListener,
        false,
      );
    };
  });

  interface QueryData {
    Source: Source[];
  }

  interface QueryVariables {
    id: string;
  }

  return (
    <Query<QueryData, QueryVariables> query={SOURCE_QUERY} variables={{ id }}>
      {({ loading, error, data }): null | JSX.Element => {
        if (loading) return null;

        if (error) return <>Error: ${error.graphQLErrors}</>;

        const unit =
          data && data.Source && data.Source.length > 0 ? data.Source[0] : null;

        return (
          <Wrapper ref={wrapperRef}>
            <Button type="button" onClick={toggleTree}>
              {isVisible ? '-' : '+'}
            </Button>
            {isVisible && unit && children({ unit })}
          </Wrapper>
        );
      }}
    </Query>
  );
};

export default Popup;
