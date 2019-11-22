import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { Row, FieldError } from './RegistrationForm.style';

interface RegistrationFieldProps {
  fieldLabel: string;
  type: string;
  name: string;
}

const RegistrationField: React.SFC<RegistrationFieldProps> = ({
  fieldLabel,
  type,
  name,
}): JSX.Element => (
  <Row>
    <label>
      {fieldLabel}
      <Field type={type} name={name} />
    </label>
    <FieldError>
      <ErrorMessage name={name} />
    </FieldError>
  </Row>
);

export default RegistrationField;
