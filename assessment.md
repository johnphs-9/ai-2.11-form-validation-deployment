# Assessment / Quiz

## Overview

- **Lesson:** Form Handling, Validation, and Deployment / 2.11
- **Format:** 10 questions (mix MCQ / True-False)
- **Time:** ~10–15 minutes
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
