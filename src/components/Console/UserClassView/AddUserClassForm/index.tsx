import React, {
  FunctionComponent,
  SyntheticEvent,
  FormEvent,
  MouseEvent,
} from 'react';

import { TextButton, HighlightedForm } from 'components/ui';

export interface AddUserClassFormProps {
  userClassName: string;
  onChange: (e: SyntheticEvent) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: (e: MouseEvent) => void;
}

const AddUserClassForm: FunctionComponent<AddUserClassFormProps> = ({
  userClassName,
  onChange,
  onSubmit,
  onCancel,
}): JSX.Element => (
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

export default AddUserClassForm;
