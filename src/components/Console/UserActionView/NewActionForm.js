import React from 'react';
import PropTypes from 'prop-types';
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

/* eslint-disable jsx-a11y/label-has-for, jsx-a11y/label-has-associated-control */
const NewActionForm = ({ errors, isSubmitting, onCancel }) => (
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
          validate={value => !value && 'Name required.'}
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
          validate={value => !value && 'Please select an Action Type.'}
          disabled={isSubmitting}
        >
          <option />
          {ACTION_TYPES.map(actionType => (
            <option key={actionType} value={actionType}>
              {actionType}
            </option>
          ))}
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
      errors.map(error => <ErrorWrapper key={v4()}>{error}</ErrorWrapper>)}

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

NewActionForm.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string),
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

NewActionForm.defaultProps = {
  errors: [],
};

export default NewActionForm;
