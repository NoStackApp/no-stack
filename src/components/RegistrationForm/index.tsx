import React from 'react';
import { Formik, Form } from 'formik';
import { useMutation } from '@apollo/react-hooks';
import * as Yup from 'yup';

import { REGISTER_USER } from 'mutations';

import RegistrationField from './RegistrationField';
import { Wrapper, Row } from './RegistrationForm.style';

interface RegistrationFormProps {
  platformId: string;
  userClassId: string;
  submitButtonText: string;
}

interface RegistrationFormValues {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

const initialValues: RegistrationFormValues = {
  name: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
};

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .label('name')
    .required('Please enter desired username.'),
  firstName: Yup.string()
    .label('firstName')
    .required('Please enter your first name.'),
  lastName: Yup.string()
    .label('lastName')
    .required('Please enter your last name.'),
  email: Yup.string()
    .label('email')
    .email('Enter a valid email.')
    .required('Please enter your email.'),
  password: Yup.string()
    .label('password')
    .matches(/(?=.*\d)/, 'Must have at least one numerical character')
    .matches(
      /(?=.*[#?!@$%^&*-.,:;'"><[\]{}()_|\\/~])/,
      'Must have at least one special character.',
    )
    .min(8, 'Must be at least 8 characters.')
    .required('Please enter your desired password.'),
  passwordConfirmation: Yup.string()
    .oneOf([Yup.ref('password'), '', null], 'Passwords must match.')
    .required('Please confirm your password.'),
});

export const RegistrationForm: React.SFC<RegistrationFormProps> = ({
  submitButtonText = 'Sign Up!',
  userClassId,
}): JSX.Element => {
  const [register] = useMutation(REGISTER_USER);

  const handleSubmit = async (
    values: RegistrationFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ): Promise<void> => {
    if (values.password !== values.passwordConfirmation) {
      return;
    }

    try {
      await register({
        variables: {
          userClassId,
          name: values.name,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
        },
      });
    } catch (error) {
      console.log(error.graphQLErrors);
    }

    setSubmitting(false);
  };

  return (
    <Wrapper>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, dirty, isValidating }): JSX.Element => (
          <Form>
            <RegistrationField fieldLabel="Username:" type="text" name="name" />
            <RegistrationField
              fieldLabel="First Name:"
              type="text"
              name="firstName"
            />
            <RegistrationField
              fieldLabel="Last Name:"
              type="text"
              name="lastName"
            />
            <RegistrationField fieldLabel="Email:" type="email" name="email" />
            <RegistrationField
              fieldLabel="Password:"
              type="password"
              name="password"
            />
            <RegistrationField
              fieldLabel="Confirm Password:"
              type="password"
              name="passwordConfirmation"
            />
            <Row>
              <button
                type="submit"
                disabled={isSubmitting || !isValid || isValidating || !dirty}
              >
                {submitButtonText}
              </button>
            </Row>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
