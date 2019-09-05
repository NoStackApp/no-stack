import React from 'react';
import compose from '@shopify/react-compose';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';
import styled from 'styled-components';
// import { v4 } from 'uuid';

// import { SOURCE_QUERY } from '../queries';
// import { SORTING_FRAGMENT } from '../fragments';

const Wrapper = styled.div`
  margin: 1.5em;
  text-align: center;
`;

const CREATE_SORTING_MUTATION = gql`
  mutation CREATE_SORTING_MUTATION(
    $id: ID!
    $order: Int!
    $typeId: ID!
    $sourceId: ID!
  ) {
    CreateSorting(id: $id, order: $order) {
      id
    }

    AddSortingType(sortingid: $id, typeid: $typeId) {
      id
    }

    AddSortingSource(sortingid: $id, sourceid: $sourceId) {
      id
    }
  }
`;

const UPDATE_SORTING_MUTATION = gql`
  mutation UPDATE_SORTING_MUTATION($id: ID!, $order: Int!) {
    UpdateSorting(id: $id, order: $order) {
      id
    }
  }
`;

const DELETE_SORTING_MUTATION = gql`
  mutation DELETE_SORTING_MUTATION($id: ID!) {
    DeleteSorting(id: $id) {
      id
    }
  }
`;

function SortingPanel() {
  return <Wrapper>For Implementation</Wrapper>;
}

// function SortingPanel({
//   type,
//   source,
//   createSorting,
//   updateSorting,
//   deleteSorting,
// }) {
//   const sorting = source.sortings.find(el => el.type.id === type.id);
//   const hasSorting = !!sorting && !!sorting.id;

//   const initialOrderValue = hasSorting ? sorting.order : 0;

//   const [order, updateOrder] = useState(initialOrderValue);
//   const [processing, updateProcessing] = useState(false);

//   function handleChange(e) {
//     const value = Number(e.target.value);

//     if (typeof value !== 'number' || Number.isNaN(value) || Number(value) < 0) {
//       return;
//     }

//     updateOrder(e.target.value);
//   }

//   function handleCreateSorting() {
//     const newSortingId = v4();

//     return createSorting({
//       variables: {
//         id: newSortingId,
//         order,
//         typeId: type.id,
//         sourceId: source.id,
//       },
//       update: cache => {
//         const data = cache.readQuery({
//           query: SOURCE_QUERY,
//           variables: {
//             id: source.id,
//           },
//         });

//         data.Source.sortings.push({
//           id: newSortingId,
//           __typename: 'Sorting',
//           order,
//           type: {
//             __typename: 'Type',
//             ...type,
//           },
//         });

//         cache.writeQuery({
//           query: SOURCE_QUERY,
//           variables: {
//             id: source.id,
//           },
//           data,
//         });
//       },
//     });
//   }

//   function handleUpdateSorting() {
//     return updateSorting({
//       variables: {
//         id: sorting.id,
//         order,
//       },
//       update: cache => {
//         const data = cache.readFragment({
//           id: sorting.id,
//           fragment: SORTING_FRAGMENT,
//         });

//         data.order = order;

//         cache.writeFragment({
//           id: sorting.id,
//           fragment: SORTING_FRAGMENT,
//           data,
//         });
//       },
//     });
//   }

//   async function handleSubmit() {
//     updateProcessing(true);

//     if (hasSorting) {
//       await handleUpdateSorting();
//     } else {
//       await handleCreateSorting();
//     }

//     updateProcessing(false);
//   }

//   function handleKeyPress(e) {
//     if (e.charCode === 13) {
//       handleSubmit();
//     }
//   }

//   async function handleRemoveButtonClick() {
//     updateProcessing(true);

//     await deleteSorting({
//       variables: {
//         id: sorting.id,
//       },
//       update: cache => {
//         const data = cache.readQuery({
//           query: SOURCE_QUERY,
//           variables: {
//             id: source.id,
//           },
//         });

//         data.Source.sortings = data.Source.sortings.filter(
//           el => el.id !== sorting.id,
//         );

//         cache.writeQuery({
//           query: SOURCE_QUERY,
//           variables: {
//             id: source.id,
//           },
//           data,
//         });
//       },
//     });

//     updateProcessing(false);
//   }

//   return (
//     <Wrapper>
//       <label htmlFor="order-field">
//         Order:{' '}
//         <input
//           id="order-field"
//           type="text"
//           onKeyPress={handleKeyPress}
//           onChange={handleChange}
//           value={order}
//           disabled={processing}
//         />
//         <button type="button" onClick={handleSubmit}>
//           {hasSorting ? 'Update' : 'Create'}
//         </button>
//         {hasSorting && (
//           <button type="button" onClick={handleRemoveButtonClick}>
//             Remove
//           </button>
//         )}
//       </label>
//       {processing && <div>Processing...</div>}
//     </Wrapper>
//   );
// }

export default compose(
  graphql(CREATE_SORTING_MUTATION, { name: 'createSorting' }),
  graphql(UPDATE_SORTING_MUTATION, { name: 'updateSorting' }),
  graphql(DELETE_SORTING_MUTATION, { name: 'deleteSorting' }),
)(SortingPanel);
