import React from 'react';
import PropTypes from 'prop-types';

import { TextButton, HighlightedForm } from 'components/ui';

const AddUserClassForm = ({ userClassName, onChange, onSubmit, onCancel }) => {
  return (
    <form onSubmit={onSubmit}>
      <HighlightedForm>
        <h4>New User Class</h4>
        <div>
          User Class Name:{' '}
          <input
            type="text"
            placeholder="name"
            onChange={onChange}
            value={userClassName}
          />
          <TextButton type="submit">Create</TextButton>
          <TextButton type="button" onClick={onCancel}>
            Cancel
          </TextButton>
        </div>
      </HighlightedForm>
    </form>
  );
};

AddUserClassForm.propTypes = {
  userClassName: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default AddUserClassForm;
