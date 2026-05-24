# Assessment / Quiz

## Overview

- **Lesson:** Form Handling, Validation, and Deployment / 2.11
- **Format:** 30 questions (mix MCQ / True-False)
- **Time:** ~30 minutes
- **Scoring:** 1 point each

## Questions

### Q1 (True/False)

json-server can be deployed to a hosting platform like Netlify so that the CRM application can be used publicly on the internet.

A - True

B - False

---

### Q2

A developer replaces `http://localhost:3001` with a MockAPI.io URL in the CRM's `CustomerContext`. What else needs to change for the app to work with MockAPI.io?

A - The HTTP methods used in fetch calls must be updated because MockAPI.io uses different verbs

B - Nothing else needs to change because the REST API contract is the same

C - The `Content-Type` header must be removed because MockAPI.io does not accept JSON

D - All component names must be renamed to match MockAPI.io's naming conventions

---

### Q3

Which of the following best describes a **controlled input** in React?

A - An input whose value is stored inside the browser's DOM and read using a ref

B - An input whose `value` prop is bound to component state and whose `onChange` updates that state

C - An input that is disabled so the user cannot modify it

D - An input that validates its own value without any React state

---

### Q4 (True/False)

In a React form's submit handler, calling `e.preventDefault()` is optional because React automatically prevents the browser's default form submission behaviour.

A - True

B - False

---

### Q5

A developer writes the following form handler:

```jsx
async function handleSubmit(e) {
  e.preventDefault();
  const res = await fetch('/api/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error('Failed');
  resetForm();
}
```

What is the purpose of `JSON.stringify(formData)` in this context?

A - It compresses the form data to reduce the request size

B - It converts the JavaScript object into a JSON string so it can be sent as the HTTP request body

C - It validates the form data against a schema before sending

D - It encrypts the form data for secure transmission

---

### Q6

A form has a Notes textarea and a Date input. The developer adds validation only inside `handleSubmit`. A user types in the Notes field and then clicks away without submitting. What happens?

A - The validation runs and an error appears immediately

B - Nothing happens — the error only appears after the user clicks the submit button

C - React automatically validates on blur because the field is required

D - The form submits itself after the blur event

---

### Q7

A developer adds a minimum-length validation rule to both `handleSubmit` and `handleBlur` for the Notes field. Later, the product owner asks to increase the minimum from 10 to 25 characters. What is the problem with this approach?

A - Yup does not support changing minimum lengths after a schema is created

B - The rule must be updated in two separate places — if one is missed, the submit and blur validations will behave differently

C - The `handleBlur` function cannot validate minimum length because it runs before the user finishes typing

D - There is no problem — duplicating the logic is the recommended pattern for form validation

---

### Q8

Which of the following correctly installs Yup?

A - `npm install @yup/validator`

B - `npm install yup`

C - `npm install react-yup`

D - `npm install yup-schema`

---

### Q9

A developer defines this Yup schema:

```jsx
const schema = yup.object().shape({
  email: yup.string().required('Email is required').email('Must be a valid email'),
  age:   yup.number().required('Age is required').min(18, 'Must be at least 18'),
});
```

What does `schema.validate({ email: '', age: 15 }, { abortEarly: false })` produce?

A - It resolves successfully because both fields are present in the object

B - It rejects with a single error for the first failing rule only

C - It rejects with errors for both `email` (required) and `age` (minimum) collected in `err.inner`

D - It throws a syntax error because `abortEarly` is not a valid Yup option

---

### Q10 (True/False)

By default, `schema.validate()` collects all failing rules across all fields and returns them together.

A - True

B - False

---

### Q11

After calling `schema.validate(formData, { abortEarly: false })` and catching the error, a developer converts the errors to a plain object with this code:

```jsx
const fieldErrors = {};
err.inner.forEach(e => {
  fieldErrors[e.path] = e.message;
});
```

What is `e.path` in this context?

A - The URL path that the form submits to

B - The name of the field in `formData` that failed validation

C - The index of the error in the `err.inner` array

D - The file path of the component that contains the schema

---

### Q12

A developer wants to validate a single field when the user leaves it (on blur), without running the entire schema. Which Yup method is appropriate?

A - `schema.validate(fieldName, value)`

B - `schema.check(fieldName, formData)`

C - `schema.validateAt(fieldName, formData)`

D - `schema.validateField(fieldName, formData)`

---

### Q13 (True/False)

When using `validateAt`, if the field passes all its rules, Yup resolves the promise and no error is thrown.

A - True

B - False

---

### Q14

A developer has this schema:

```jsx
const schema = yup.object().shape({
  notes: yup.string().required('Required').min(10, 'Too short'),
});
```

The user types `"Hello"` (5 characters) in the Notes field and clicks away. `validateAt('notes', { notes: 'Hello' })` is called. What does `err.message` contain in the catch block?

A - `"Required"`

B - `"Too short"`

C - Both messages joined with a comma

D - An empty string because the field is not empty

---

### Q15

Which of the following correctly displays a Yup field error in JSX?

A -
```jsx
<p>{errors}</p>
```

B -
```jsx
{errors.notes && <p className="field-error">{errors.notes}</p>}
```

C -
```jsx
<p>{yup.errors.notes}</p>
```

D -
```jsx
{schema.errors.notes}
```

---

### Q16

What is the main advantage of defining a Yup schema **outside** the component function (at module level), rather than inside the component?

A - Yup schemas defined inside a component cause React to throw an error

B - Defining the schema outside prevents it from being recreated on every render

C - Yup can only read variables that are in the module scope

D - Schemas defined inside components are not allowed to use `.required()`

---

### Q17

In Vite, environment variables are defined in `.env` files. Which of the following variable names will be accessible in browser (client-side) code via `import.meta.env`?

A - `API_BASE_URL`

B - `REACT_APP_API_BASE_URL`

C - `VITE_API_BASE_URL`

D - `PUBLIC_API_BASE_URL`

---

### Q18 (True/False)

A variable defined in `.env.production` as `DATABASE_PASSWORD=secret` will be included in the JavaScript bundle that users download from the deployed site.

A - True

B - False

---

### Q19

A developer sets `VITE_API_BASE_URL` in `.env.development` but forgets to create `.env.production`. The app works locally with `npm run dev`. What happens when `npm run build` is run and the built app is opened?

A - Vite throws a build error because the production env file is missing

B - `import.meta.env.VITE_API_BASE_URL` is `undefined` in the built bundle, so all API calls fail

C - Vite automatically copies `.env.development` to `.env.production` during the build

D - The variable defaults to `http://localhost:3001` in production builds

---

### Q20

Why should `.env.development` and `.env.production` files be added to `.gitignore`?

A - Git cannot track files with dots in the name

B - These files may contain secrets such as API keys; committing them to a public repository exposes those secrets permanently

C - Vite refuses to read env files that have been committed to Git

D - Netlify requires env files to be excluded from the repository before it can deploy

---

### Q21

A Netlify build fails with the error: `import.meta.env.VITE_API_BASE_URL is not defined`. The developer checks the source code and the variable is used correctly. What is the most likely cause?

A - Netlify does not support Vite environment variables

B - The `VITE_API_BASE_URL` environment variable was not set in the Netlify dashboard before the build ran

C - The variable name is missing the `REACT_APP_` prefix required by Netlify

D - The `.env.production` file must be committed to the repository for Netlify to read it

---

### Q22

A developer adds `VITE_API_BASE_URL` to the Netlify environment variables dashboard after an initial deploy. The live site still shows the old hardcoded URL. What must they do?

A - Push a new commit to trigger a fresh build

B - Trigger a manual redeploy so the build runs again with the new variable value

C - Delete the site and create a new one

D - Nothing — Netlify applies environment variable changes to the live site instantly without rebuilding

---

### Q23 (True/False)

Netlify injects `VITE_API_BASE_URL` into the running Node.js server at runtime so that the React app can read it dynamically after it has been deployed.

A - True

B - False

---

### Q24

What are the correct build settings for deploying a Vite + React application to Netlify?

A - Build command: `npm start`, Publish directory: `build`

B - Build command: `npm run build`, Publish directory: `dist`

C - Build command: `npm run dev`, Publish directory: `public`

D - Build command: `vite deploy`, Publish directory: `out`

---

### Q25

A developer pushes a new commit to the `main` branch of their GitHub repository after connecting it to Netlify. What happens automatically?

A - Nothing — deploys must always be triggered manually from the Netlify dashboard

B - Netlify detects the push, clones the repository, runs the build command, and publishes the updated site

C - GitHub sends the built files to Netlify's CDN directly, bypassing the build step

D - Netlify creates a new site for the new commit and keeps the old site running

---

### Q26

The `onSuccess` prop in `AddInteractionForm` is called after a successful API submission. In `CustomerDetail.jsx`, it is currently wired as:

```jsx
<AddInteractionForm customerId={id} onSuccess={() => console.log('Saved')} />
```

A developer wants to display a success banner instead of logging to the console. What change is needed?

A - Replace `console.log('Saved')` with a function that sets a `successMessage` state variable in `CustomerDetail`

B - Remove the `onSuccess` prop — Yup handles success messages automatically

C - Add a `successMessage` prop directly to `AddInteractionForm` and hardcode the message inside the component

D - Yup's `validate()` method triggers `onSuccess` automatically when all fields are valid

---

### Q27

The Formik `useFormik` hook accepts a `validationSchema` option. What does this option accept?

A - A plain JavaScript object where each key is a field name and each value is an error message string

B - A Yup schema object

C - A function that takes form values and returns a boolean

D - An array of field names that are required

---

### Q28 (True/False)

When using Formik's `getFieldProps('notes')`, the returned object includes `value`, `onChange`, and `onBlur` for that field, replacing the need to manage those individually with `useState`.

A - True

B - False

---

### Q29

In a Formik form, an error message for the `notes` field is rendered conditionally:

```jsx
{formik.touched.notes && formik.errors.notes && (
  <p className="field-error">{formik.errors.notes}</p>
)}
```

Why is `formik.touched.notes` checked before `formik.errors.notes`?

A - `formik.errors.notes` is always `undefined` until the field has been touched

B - Checking `touched` prevents error messages from appearing before the user has interacted with the field, so the form does not show errors on first render

C - Formik requires the `touched` check for TypeScript type safety

D - Without the `touched` check, the error would appear on every keystroke rather than only after blur

---

### Q30

A developer builds a form with 10 fields using `useState` (one state variable per field), a combined `errors` state object, manual `handleChange`, and manual `handleBlur`. A colleague suggests switching to Formik. What is the strongest argument for making this switch?

A - Formik supports more validation rules than Yup can provide on its own

B - Formik eliminates the per-field `useState`, `handleChange`, and `handleBlur` boilerplate by managing all form state internally, keeping the component focused on layout rather than plumbing

C - Formik is required for any form that uses a Yup schema

D - Formik prevents all runtime errors in form submissions

---
