import React, { FunctionComponent } from 'react';
import { Form, Field, ErrorMessage } from 'formik';
import { v4 } from 'uuid';
import styled from 'styled-components';

const ACTION_TYPES = [
  'UPLOAD',
  'APPROVE_UPLOAD',
  'CONTACT',
  'INVITE',
  'ACCEPT_INVITATION',
  'FIRST_LOGIN',
  'RESPOND',
  'NOTIFY',
  'FOLLOW',
  'PAY',
  'BUY',
  'RENT',
  'POST',
  'REQUEST_NEW_PASSWORD',
  'SET_PASSWORD',
  'LOGIN',
  'REFRESH_USER_TOKEN',
  'VERIFY_USER_TOKEN',
  'CREATE_INSTANCE_WITHOUT_PARENT',
  'CREATE_PUBLIC_INSTANCE',
  'CREATE_INSTANCE_ASSN',
];

const FieldWrapper = styled.div`
  margin: 1.5em 0;
`;

const ErrorWrapper = styled.div`
  margin: 1.5em 0;
  color: red;
`;

export interface NewActionFormProps {
  errors?: string[];
  isSubmitting: boolean;
  onCancel: () => void;
}

/* eslint-disable jsx-a11y/label-has-for, jsx-a11y/label-has-associated-control */
const NewActionForm: FunctionComponent<NewActionFormProps> = ({
  errors = [],
  isSubmitting,
  onCancel,
}): JSX.Element => (
  <Form>
    <h2>New Action</h2>
    <FieldWrapper>
      <label htmlFor="actionName">
        Name:{' '}
        <Field
          id="actionName"
          name="actionName"
          placeholder="name"
          disabled={isSubmitting}
          validate={(value: string): string | boolean =>
            !value && 'Name required.'
          }
        />
      </label>
    </FieldWrapper>

    <ErrorWrapper>
      <ErrorMessage name="actionName" />
    </ErrorWrapper>

    <FieldWrapper>
      <label htmlFor="type">
        Type:{' '}
        <Field
          id="type"
          name="type"
          component="select"
          validate={(value: string): string | boolean =>
            !value && 'Please select an Action Type.'
          }
          disabled={isSubmitting}
        >
          <option />
          {ACTION_TYPES.map(
            (actionType: string): JSX.Element => (
              <option key={actionType} value={actionType}>
                {actionType}
              </option>
            ),
          )}
        </Field>
      </label>
    </FieldWrapper>

    <ErrorWrapper>
      <ErrorMessage name="type" />
    </ErrorWrapper>

    <FieldWrapper>
      <label htmlFor="params">
        Params:{' '}
        <Field
          id="params"
          name="params"
          placeholder="params"
          component="textarea"
          rows="10"
          style={{ width: '80%' }}
          disabled={isSubmitting}
        />
      </label>
    </FieldWrapper>

    <ErrorWrapper>
      <ErrorMessage name="params" />
    </ErrorWrapper>

    {errors &&
      errors.length > 0 &&
      errors.map(
        (error: string): JSX.Element => (
          <ErrorWrapper key={v4()}>{error}</ErrorWrapper>
        ),
      )}

    <FieldWrapper>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Action...' : 'Create Action'}
      </button>{' '}
      <button type="button" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </button>
    </FieldWrapper>
  </Form>
);

export default NewActionForm;
