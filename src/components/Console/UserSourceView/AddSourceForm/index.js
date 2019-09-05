import React from 'react';
import PropTypes from 'prop-types';

import { TextButton, HighlightedForm } from 'components/ui';

const AddSourceForm = ({
  sourceName,
  onChange,
  onSubmit,
  onCancel,
  disabled,
}) => (
  <form>
    <HighlightedForm>
      <h4>New Source</h4>
      Name:{' '}
      <input
        type="text"
        value={sourceName}
        onChange={onChange}
        disabled={disabled}
      />
      <TextButton type="button" onClick={onSubmit} disabled={disabled}>
        Add
      </TextButton>
      <TextButton type="button" onClick={onCancel} disabled={disabled}>
        Cancel
      </TextButton>
    </HighlightedForm>
  </form>
);

AddSourceForm.propTypes = {
  sourceName: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default AddSourceForm;
