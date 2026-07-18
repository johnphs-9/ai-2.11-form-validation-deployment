# Lesson 2.11: Form Handling, Validation, and Deployment

## Overview

- **Duration:** ~2 hours 15 minutes (hands-on lab)
- **Prerequisites:** Lesson 2.8: Routing and Navigation with React Router

## Learning Objectives

By the end of this lesson, you will be able to:

1. **Build** a controlled form in React and handle submission with client-side validation
2. **Apply** a Yup schema to validate form input and display field-level error messages
3. **Deploy** a React application to Netlify using environment variables for configuration

## Introduction

At the end of Lesson 2.8, your CRM had multiple pages, protected routes, and programmatic navigation. All its data came from a local json-server running on your machine. That works well for development, and you will keep using it for most of this lesson.

In this lesson you will extend the CRM with a new feature: logging customer interactions. You will build a controlled form, add validation by hand, then replace that manual validation with a Yup schema. Only once the feature works locally will you face the question of deployment, at which point you will discover that json-server cannot be deployed, move the app to a hosted mock API, and publish the finished app to Netlify.

By the end of the lab, a user can open a live URL, view the customer list, navigate to a customer detail page, log an interaction with validated input, and see it appear in a list of past interactions.

---

## Part 1: Build the Add Interaction Form (30 minutes)

### The Feature

A CRM's core purpose is tracking communication with customers. In this part you will add a form to the customer detail page that lets a user log a new interaction: a phone call, an email, or a meeting. You will keep using the local json-server from Lesson 2.8 for now; nothing about building the form requires a different backend.

### Add an Interactions Resource to db.json

Open `data/db.json` and add an `interactions` array alongside `customers`:

```json
// data/db.json
"interactions": []
```

Each interaction will store a `customerId` field pointing back to the customer it belongs to. This is the same pattern you already know from foreign keys in a relational database, except json-server (and later MockAPI.io) has no `JOIN`. You fetch customers and interactions separately and match them up in React.

### Create the AddInteractionForm Component

Every styled component in the CRM ships with its own CSS module (`CustomerCard.module.css`, `CustomerDetailPage.module.css`, and so on). `AddInteractionForm` follows the same convention.

Download [`assets/AddInteractionForm.module.css`](assets/AddInteractionForm.module.css) and copy it to `src/components/AddInteractionForm.module.css`. It defines `.form`, `.heading`, `.field`, `.fieldError`, and `.submitButton`, using the same `--space-*`, `--text-*`, and `--primary-*` custom properties as the rest of the CRM's styles.

Now create `src/components/AddInteractionForm.jsx`. Handlers in this codebase are written as arrow functions assigned to `const`, matching the style already used in `NewCustomerPage.jsx`'s `handleChange` and `handleSubmit`:

```jsx
// src/components/AddInteractionForm.jsx
import { useState } from "react";
import { API_BASE } from "../App";
import styles from "./AddInteractionForm.module.css";

const EMPTY_FORM = {
  type: "call",
  notes: "",
  date: new Date().toISOString().split("T")[0],
};

function AddInteractionForm({ customerId, onSuccess }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, customerId }),
      });
      if (!res.ok) throw new Error("Failed to save interaction");
      const savedInteraction = await res.json();
      setFormData(EMPTY_FORM);
      onSuccess(savedInteraction);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.heading}>Log Interaction</h3>

      <div className={styles.field}>
        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={submitting}
        >
          <option value="call">Phone Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          disabled={submitting}
          placeholder="What was discussed?"
        />
        {errors.notes && <p className={styles.fieldError}>{errors.notes}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          disabled={submitting}
        />
        {errors.date && <p className={styles.fieldError}>{errors.date}</p>}
      </div>

      <button type="submit" className={styles.submitButton} disabled={submitting}>
        {submitting ? "Saving..." : "Log Interaction"}
      </button>
    </form>
  );
}

export default AddInteractionForm;
```

`API_BASE` is imported from `App.jsx`, the same constant every other page already uses. There is only one place in the whole app where the API's base URL is defined; you are reusing it, not hardcoding a second copy.

`handleSubmit` reads the response body with `res.json()` and passes the saved interaction, server-assigned `id` included, to `onSuccess`. This mirrors `addCustomer` in `CustomerContext.jsx`, which already returns the newly created customer so the caller can use it. `CustomerDetailPage` will use this value in the next step to add the interaction straight into its own state, without asking the server again for data it already has.

### Display the Interaction List

Right now, submitting the form gives no visible confirmation that it worked. Fetch the customer's existing interactions once, and add new ones to state as they are created, so a submission shows up immediately.

```jsx
// src/pages/CustomerDetailPage.jsx
import { useState, useEffect, useContext } from "react";
import AddInteractionForm from "../components/AddInteractionForm";

// Inside CustomerDetailPage:
const [interactions, setInteractions] = useState([]);

useEffect(() => {
  const fetchInteractions = async () => {
    const response = await fetch(`${API_BASE}/interactions?customerId=${id}`);
    const data = await response.json();
    setInteractions(data);
  };
  fetchInteractions();
}, [id]); // re-fetch only when the id in the URL changes
```

`?customerId=${id}` is a json-server query filter; it returns only interactions whose `customerId` field matches. This is the same relational pattern you will use with MockAPI.io later, and it is the same idea behind a `WHERE` clause in SQL: since interactions live in their own flat collection, you filter them yourself instead of relying on a join.

The `.interactionList` and `.interactionList li` rules for the list you are about to render are already in [`assets/CustomerDetailPage.module.css`](assets/CustomerDetailPage.module.css). Add them to your `src/pages/CustomerDetailPage.module.css`.

Render the form and the list below the existing sections:

```jsx
// src/pages/CustomerDetailPage.jsx
<AddInteractionForm
  customerId={id}
  onSuccess={(savedInteraction) =>
    setInteractions((prev) => [...prev, savedInteraction])
  }
/>

<div className={styles.section}>
  <p className={styles.sectionLabel}>Interaction History</p>
  {interactions.length === 0 ? (
    <p className={styles.notesEmpty}>No interactions logged yet.</p>
  ) : (
    <ul className={styles.interactionList}>
      {interactions.map((interaction) => (
        <li key={interaction.id}>
          <strong>{interaction.type}</strong> on {interaction.date}
          <p>{interaction.notes}</p>
        </li>
      ))}
    </ul>
  )}
</div>
```

`onSuccess` receives the interaction that `handleSubmit` just read from the response body and appends it to `interactions` directly. There is no second network request: the server already told you what it saved, so `CustomerDetailPage` reuses that value instead of asking again.

**Browser check:** Navigate to a customer detail page. The "Log Interaction" form should appear below the customer's details. Fill it in and submit. The new interaction should appear in the Interaction History list immediately, with no visible loading state, because no refetch happened. Open `data/db.json` (or the json-server admin UI at `http://localhost:3001/interactions`) and confirm the record was saved with the correct `customerId`.

### Add Manual Validation

Right now the form submits even with an empty Notes field. Add basic validation to `handleSubmit` and an `onBlur` handler on the textarea:

```jsx
// src/components/AddInteractionForm.jsx
const handleBlur = (e) => {
  const { name, value } = e.target;
  if (name === "notes" && value.trim() === "") {
    setErrors((prev) => ({ ...prev, notes: "Notes are required." }));
  } else if (name === "date" && !value) {
    setErrors((prev) => ({ ...prev, date: "Date is required." }));
  } else {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.notes.trim() === "") {
    setErrors({ notes: "Notes are required." });
    return;
  }
  if (!formData.date) {
    setErrors({ date: "Date is required." });
    return;
  }

  setSubmitting(true);
  // ... rest of submit logic
};
```

Add `onBlur={handleBlur}` to the textarea and the date input:

```jsx
// src/components/AddInteractionForm.jsx
<textarea
  id="notes"
  name="notes"
  rows={3}
  value={formData.notes}
  onChange={handleChange}
  onBlur={handleBlur}
  disabled={submitting}
  placeholder="What was discussed?"
/>
{errors.notes && <p className={styles.fieldError}>{errors.notes}</p>}

// ...

<input
  id="date"
  name="date"
  type="date"
  value={formData.date}
  onChange={handleChange}
  onBlur={handleBlur}
  disabled={submitting}
/>
{errors.date && <p className={styles.fieldError}>{errors.date}</p>}
```

Both Notes and Date are now checked in both places:

- Leave the field empty (`onBlur`)
- Try to submit (`handleSubmit`)

`EMPTY_FORM` defaults `date` to today, so `formData.date` is never empty on a fresh form; the `date` checks in both handlers exist for the case where the user clears the date picker by hand after it has already been filled in. Defaulting to today is deliberate: a "when did this happen" field should not force the user to pick a date that is almost always today anyway.

Notice that `handleSubmit` returns as soon as the first check fails. If both Notes and Date are empty, only the Notes error is ever set, `setErrors({ notes: ... })` runs and the function returns before the date check is reached. Fixing this manually would mean collecting every error into one object before deciding whether to stop, exactly the kind of bookkeeping Yup will handle for you in the next part.

**Browser check:** Submit with an empty Notes field. The error message should appear below the textarea. Type something in the field and click away; the error should clear. Then clear the date field and click away; the date error should appear the same way. Now clear both fields and submit: only the Notes error appears, the Date check never runs because `handleSubmit` already returned.

> Notice the problem: the validation logic for each field is written twice, once in `handleSubmit` and once in `handleBlur`. If you add a new rule (say, notes must be at least 10 characters), you must update both places, for every field. For two fields this is manageable. For a form with eight fields and multiple rules each, this approach becomes a maintenance burden.

---

## Activity: Add a Minimum Length Rule (10 minutes)

Using the same manual approach, add a second validation rule: the Notes field must contain at least 10 characters (after trimming whitespace).

**Task:** Update both `handleBlur` and `handleSubmit` so that:

1. Submitting with fewer than 10 characters shows the error: `"Notes must be at least 10 characters."`
2. Blurring the field with fewer than 10 characters shows the same message
3. The error clears when the field has 10 or more characters

**Hints:**

1. You need to check both `value.trim() === ''` and `value.trim().length < 10`. Which check should come first?
2. A single `notes` key in the `errors` state object is enough; just update it to the appropriate message.
3. To clear the error, set the key back to an empty string `''` and render it as `{errors.notes && <p>...</p>}` so nothing renders when the string is empty.
4. Try submitting with exactly 9 characters, then 10. Does the error appear and clear at the right point?
5. Optional stretch: the current `handleSubmit` returns after the first failing field, so clearing both Notes and Date and submitting only ever shows the Notes error. Can you restructure it to compute both fields' errors first, then decide whether to stop?

<details>
<summary>Reference solution</summary>

Extract a shared helper to avoid duplicating the logic:

```jsx
// src/components/AddInteractionForm.jsx
function validateNotes(value) {
  if (value.trim() === "") return "Notes are required.";
  if (value.trim().length < 10) return "Notes must be at least 10 characters.";
  return "";
}

const handleBlur = (e) => {
  const { name, value } = e.target;
  if (name === "notes") {
    setErrors((prev) => ({ ...prev, notes: validateNotes(value) }));
  } else if (name === "date") {
    setErrors((prev) => ({ ...prev, date: value ? "" : "Date is required." }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const notesError = validateNotes(formData.notes);
  const dateError = formData.date ? "" : "Date is required.";
  if (notesError || dateError) {
    setErrors({ notes: notesError, date: dateError });
    return;
  }
  // ... proceed with submission
};
```

Extracting `validateNotes` removes most of the duplication. Notice that this pattern, a standalone validator function per field, is exactly what Yup formalises into a schema. You just built a miniature version of it.

This version also fixes the bug from the previous section, where `handleSubmit` returned after the first failing field, hiding any other errors. Here, `notesError` and `dateError` are both computed before the `if` check, so `setErrors({ notes: notesError, date: dateError })` reports both fields at once. This is the same idea behind Yup's `abortEarly: false`, which you will meet next: compute every error first, then decide whether to stop.

</details>

---

## Part 2: Replace Manual Validation with Yup (25 minutes)

### Why Use a Validation Library

Even with the `validateNotes` helper from the activity, validation rules are still mixed into the component. Every rule change means opening the component file and editing function bodies. There is no single place to look up "what are all the rules for this form?"

Yup solves this by letting you define a **schema**: a standalone object that lists every field and its rules. The component calls `schema.validate()` once and receives all errors back. The schema does not know about React state, and the component does not know about the rules.

### Install Yup

```bash
npm install yup
```

### Define a Validation Schema

At the top of `AddInteractionForm.jsx`, add the import and replace the manual validator functions with a Yup schema:

```jsx
// src/components/AddInteractionForm.jsx
import * as yup from "yup";

const interactionSchema = yup.object().shape({
  type: yup.string().required("Interaction type is required"),
  notes: yup
    .string()
    .required("Notes are required.")
    .min(10, "Notes must be at least 10 characters."),
  date: yup
    .date()
    .typeError("Date is required.")
    .required("Date is required.")
    .max(new Date(), "Date cannot be in the future."),
});
```

Each key matches a field in `formData`, and each method in the chain is a rule. The string argument to a rule becomes the error message when that rule fails:

- `type`: must be present (`.required()`)
- `notes`: must be present, and at least 10 characters (`.min(10, ...)`)
- `date`: must be a valid date (`.typeError()`), present (`.required()`), and not in the future (`.max()`)

`yup.date()` parses the `<input type="date">` string into a real `Date` before applying rules, which is what makes `.max(new Date(), ...)` possible. But an empty string cannot be parsed into a date at all, `new Date("")` is `Invalid Date`, so Yup treats it as a type mismatch rather than a missing value, and by default throws its own generic message instead of your `.required()` one. `.typeError(...)` overrides that generic message.

In this form, `.typeError()` is what actually catches an empty date field; `.required()` only matters if `formData.date` could ever be `undefined` rather than `""`, which it currently cannot, `EMPTY_FORM` always sets it to a string. `.required()` stays in the schema anyway, so the schema keeps working correctly on its own terms even if the component changes later, and so `date` follows the same "required first, then a more specific rule" shape as `type` and `notes`. Both messages say the same thing on purpose: whichever check actually fires, the learner sees the same "Date is required." error.

### Validate on Submit

Replace the manual `if` checks in `handleSubmit` with a single `schema.validate()` call:

```jsx
// src/components/AddInteractionForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await interactionSchema.validate(formData, { abortEarly: false });
  } catch (err) {
    const fieldErrors = {};
    err.inner.forEach((validationError) => {
      fieldErrors[validationError.path] = validationError.message;
    });
    setErrors(fieldErrors);
    return;
  }

  setSubmitting(true);
  try {
    const res = await fetch(`${API_BASE}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, customerId }),
    });
    if (!res.ok) throw new Error("Failed to save interaction");
    const savedInteraction = await res.json();
    setErrors({});
    setFormData(EMPTY_FORM);
    onSuccess(savedInteraction);
  } catch (err) {
    alert(err.message);
  } finally {
    setSubmitting(false);
  }
};
```

`validate()` always returns a Promise, since Yup rules can themselves be asynchronous, so it needs `await`.

`{ abortEarly: false }` tells Yup to collect all failures instead of stopping at the first one. When the form is submitted empty, all missing-field errors appear at once.

`err.inner` is an array of `ValidationError` objects, one per failed field. Each has a `.path` (the field name, matching the key in `formData`) and a `.message` (the string you wrote in the schema).

### Validate on Blur with validateAt

Replace `handleBlur` with a Yup-powered version that validates a single field:

```jsx
// src/components/AddInteractionForm.jsx
const handleBlur = async (e) => {
  const { name, value } = e.target;
  try {
    await interactionSchema.validateAt(name, { ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  } catch (err) {
    setErrors((prev) => ({ ...prev, [name]: err.message }));
  }
};
```

`validateAt(fieldName, values)` runs only the rules for the named field, but it still takes the whole values object as its second argument, not just that field's value, because a rule can depend on a sibling field (via Yup's `.when()`, not used here, but supported). `{ ...formData, [name]: value }` passes the full form state with the just-changed field overlaid on top. If it throws, `err.message` is the first failing rule for that field. Add `onBlur={handleBlur}` to the textarea and the date input.

**Browser check:**

1. Clear the date field, leave Notes empty, and submit. Both the notes and date errors should appear at once, `formData.date` starts out as today's date, so this is the only way to see the "Date is required." message.
2. Type 5 characters in Notes and click away. The minimum-length error should appear immediately.
3. Type 5 more characters and click away again. The error should clear.
4. Change the date field to a date in the future and click away. "Date cannot be in the future." should appear immediately.
5. Fill the form correctly and submit. The form should reset and the new interaction should appear in the list below.

> The schema is now the single source of truth for validation rules. To change the minimum length from 10 to 20, you edit one line in `interactionSchema`. The component code does not change.

---

## Activity: Validate the New Customer Form with Yup (15 minutes)

`src/pages/NewCustomerPage.jsx` already has a form for adding a customer, built back in Lesson 2.8. Its `firstName`, `lastName`, and `email` inputs each carry the HTML `required` attribute, but that is the only validation in place: the browser's built-in message is generic, easy to bypass with dev tools, and `email` accepts any non-empty string, `"not-an-email"` submits without complaint.

**Task:** Apply the same Yup pattern you just used in `AddInteractionForm` to `NewCustomerPage`.

1. Define a `customerSchema` with `yup.object().shape({...})`:
   - `firstName`: required
   - `lastName`: required
   - `email`: required, and must be a valid email address
2. Remove the `required` attribute from the three inputs; Yup is now responsible for enforcing this, not the browser.
3. Add an `errors` state object with `useState({})`, the same pattern `AddInteractionForm` uses.
4. In `handleSubmit`, validate `form` against `customerSchema` with `{ abortEarly: false }` before calling `addCustomer`. On failure, build a `fieldErrors` object from `err.inner` and stop before the network request.
5. Add a `handleBlur` using `customerSchema.validateAt(name, form)`, the same shape as `AddInteractionForm`'s.
6. Render each field's error below its input.

**Hints:**

1. `yup.string().email('Please enter a valid email address')` is the rule that catches `"not-an-email"`. `.email()` accepts an optional message string just like `.required()` and `.min()` do.
2. `NewCustomerPage.jsx` already imports `useState` for `form`; add a second `useState({})` call for `errors` alongside it.
3. `handleSubmit` currently calls `addCustomer` directly. The validation step needs to happen first, inside a `try/catch` around `customerSchema.validate(form, { abortEarly: false })`, with `addCustomer` moved into the code that runs after validation succeeds.
4. The error-rendering markup is identical in shape to `AddInteractionForm`: `{errors.firstName && <p className="field-error">{errors.firstName}</p>}`. Since `NewCustomerPage.jsx` uses plain string classNames rather than a CSS module, add a `.field-error` rule to `App.css` rather than a module.

```css
/* src/App.css: add near .form-field */
.field-error {
  color: var(--danger-600);
  font-size: var(--text-xs);
  margin-top: var(--space-1);
}
```

<details>
<summary>Reference solution</summary>

```jsx
// src/pages/NewCustomerPage.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router";
import * as yup from "yup";
import { CustomerContext } from "../contexts/CustomerContext";

const ALL_TAGS = ["VIP", "Lead", "Referral"];

const customerSchema = yup.object().shape({
  firstName: yup.string().required("First name is required."),
  lastName: yup.string().required("Last name is required."),
  email: yup
    .string()
    .required("Email is required.")
    .email("Please enter a valid email address."),
});

function NewCustomerPage() {
  const { addCustomer, submitting } = useContext(CustomerContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "active",
    tags: [],
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    try {
      await customerSchema.validateAt(name, { ...form, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleTagToggle = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await customerSchema.validate(form, { abortEarly: false });
    } catch (err) {
      const fieldErrors = {};
      err.inner.forEach((validationError) => {
        fieldErrors[validationError.path] = validationError.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const newCustomer = await addCustomer({
      ...form,
      company: "",
      notes: "",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    navigate(`/app/customers/${newCustomer.id}`);
  };

  return (
    <div>
      <Link to="/app/customers" className="back-link">
        ← Back to Customers
      </Link>
      <h1>Add New Customer</h1>

      <form onSubmit={handleSubmit} className="add-customer-form">
        <div className="form-field">
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            placeholder="e.g. Sarah"
            value={form.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.firstName && <p className="field-error">{errors.firstName}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            placeholder="e.g. Chen"
            value={form.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.lastName && <p className="field-error">{errors.lastName}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. sarah.chen@email.com"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            placeholder="e.g. +65 9123 4567"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label>Tags</label>
          <div className="tag-options">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`tag-toggle${form.tags.includes(tag) ? " tag-toggle-active" : ""}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting ? "Adding..." : "Add Customer"}
        </button>
      </form>
    </div>
  );
}

export default NewCustomerPage;
```

Same pattern as `AddInteractionForm`, just different field names.

</details>

**Browser check:** Navigate to "Add New Customer." Submit the form empty; `firstName`, `lastName`, and `email` errors should all appear at once. Type `"not-an-email"` into the email field and click away; the "valid email address" error should appear immediately. Fix it and submit a complete form; you should land on the new customer's detail page as before.

---

## Part 3: Replace json-server with MockAPI.io (20 minutes)

### Why json-server Cannot Deploy

Everything works locally, but json-server only runs on your own machine. Your CRM currently fetches data from `http://localhost:3001`. When the same code runs on Netlify's servers, or in a user's browser after deployment, there is no process listening on port 3001, and every request fails. To deploy the app, you need an API that is reachable from anywhere on the internet, not just your laptop.

MockAPI.io solves this by hosting a REST API at a public URL. The API contract is almost identical to json-server: the same `GET /customers`, `POST /customers`, and `DELETE /customers/:id` endpoints, plus the same `?customerId=` query filtering you just used for interactions. The one exception is updating a record: MockAPI.io's CORS configuration does not allow the `PATCH` method, only `PUT`, so `updateCustomer` needs a small change, covered below. Aside from that, only the base URL changes.

### Create a MockAPI.io Project

1. Go to [https://mockapi.io](https://mockapi.io) and create a free account.
2. Click **New Project** and give it a name (for example, `simple-crm`).
3. Click **New Resource** and name it `customers`. Add the following fields, matching the shape your app already expects from `data/db.json`:

   | Field name | Type |
   |------------|------|
   | `firstName` | String |
   | `lastName` | String |
   | `email` | String |
   | `phone` | String |
   | `status` | String |
   | `company` | String |
   | `notes` | String |
   | `tags` | Array |

   > Do not click **Generate** to seed sample data. MockAPI.io's schema builder fills `status` and `tags` with random values that do not match what the app expects: `status` needs to be exactly `"active"` or `"inactive"`, and `tags` needs to be an array of short strings (for example `["VIP", "Referral"]`). `CustomerCard.jsx` and `CustomerDetailPage.jsx` both read these fields directly, and `tags.map(...)` will throw if `tags` is missing. You will add real customers through the app itself once it is connected, further down this section.

4. Click **New Resource** again and name it `interactions`. Add these fields:

   | Field name | Type |
   |------------|------|
   | `customerId` | String |
   | `type` | String |
   | `notes` | String |
   | `date` | String |

5. Copy the base URL shown at the top of the project page. It looks like:
   ```
   https://64f1a2b3c5b4b.mockapi.io/api/v1
   ```

> MockAPI.io free accounts are limited to one project and two resources. The `customers` and `interactions` resources are exactly what you need for this lesson.

### Connect the CRM to MockAPI.io

Because every page and context already imports `API_BASE` from `App.jsx`, there is exactly one line to change. Open `src/App.jsx`:

```jsx
// src/App.jsx
export const API_BASE = "https://YOUR-PROJECT-ID.mockapi.io/api/v1";
```

For now, replace the URL directly in the source. You will move it to an environment variable in the next part.

### Fix updateCustomer for MockAPI.io

Open `src/contexts/CustomerContext.jsx` and find the `updateCustomer` function you wrote in Lesson 2.6. It sends its request with `method: "PATCH"`:

```jsx
// src/contexts/CustomerContext.jsx
const updateCustomer = async (customerId, updates) => {
  try {
    const response = await fetch(`${API_BASE}/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    // ...
```

Change `"PATCH"` to `"PUT"`:

```jsx
// src/contexts/CustomerContext.jsx
const updateCustomer = async (customerId, updates) => {
  try {
    const response = await fetch(`${API_BASE}/customers/${customerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    // ...
```

> MockAPI.io's CORS settings cannot be configured, and only allow `PUT` for updates, not `PATCH`. Functionally, `PUT` works exactly the same way here: it still only updates the fields present in the body.

### Fix fetchInteractions for MockAPI.io

json-server returns an empty array when a `?customerId=` filter matches no records. MockAPI.io does not: since it has no real relational join, a customer with no interactions yet causes its `interactions` endpoint to respond with a "Not found" error instead of `[]`. This shows up right after adding a new customer, since a brand-new customer has no interactions.

Open `src/pages/CustomerDetailPage.jsx` and update `fetchInteractions` to handle this case:

```jsx
// src/pages/CustomerDetailPage.jsx
useEffect(() => {
  const fetchInteractions = async () => {
    const response = await fetch(`${API_BASE}/interactions?customerId=${id}`);
    if (!response.ok) {
      setInteractions([]);
      return;
    }
    const data = await response.json();
    setInteractions(data);
  };
  fetchInteractions();
}, [id]); // re-fetch only when the id in the URL changes
```

> Checking `response.ok` before parsing the body is the same pattern `fetchCustomer` already uses earlier in this file. Here, a failed response simply means "no interactions yet," so the customer detail page falls back to an empty list instead of showing an error. This is a quirk of MockAPI.io's flat, non-relational storage, not something you would normally need to guard against. A real backend, including the Spring Boot API you will build in Module 3, returns an empty array for a query that correctly matches zero records, since the customer itself does exist.

**Browser check:** Start the dev server with `npm run dev`. The customer list page will be empty, since the `customers` resource has no records yet. Use the app's own "Add Customer" form to add one or two customers; because `addCustomer` updates local state directly, they should appear in the list immediately with no page reload. Open the Network tab in your browser dev tools and confirm the requests are going to the mockapi.io domain, not localhost. Open a customer detail page and confirm the interaction form and list still work end to end against the new API, including editing a customer. The Interaction History should show "No interactions logged yet." instead of an error, since this customer was just created and has no interactions.

> Adding customers through the app, rather than MockAPI.io's Generate button or its data table, guarantees `status` and `tags` are always in the shape the app expects.

---

## Part 4: Environment Variables (10 minutes)

### What Is an Environment Variable

An environment variable is a named value read at build or run time, kept outside source code and outside Git. This lets the same codebase point at a different API in development, staging, and production without editing or committing code, and it is the standard place for values that should never appear in the repository, such as API keys.

### The Problem with a Hardcoded URL

The MockAPI.io base URL is currently a string literal in `App.jsx`. Every time you need to point the app at a different API (a test server, a staging environment, the production endpoint), you must edit source code and commit the change.

Environment variables solve this. You define the URL once in a configuration file, outside of source control, and the app reads it at build time. Switching environments means editing a config file, not editing code.

### Create Environment Files

Create two files in the root of `simple-crm-web/` (the same folder as `package.json`):

**.env.development**

```
# .env.development
VITE_API_BASE_URL=http://localhost:3001
```

**.env.production**

```
# .env.production
VITE_API_BASE_URL=https://YOUR-PROJECT-ID.mockapi.io/api/v1
```

Vite loads `.env.development` when you run `npm run dev` and `.env.production` when you run `npm run build`, so `npm run dev` points at your local json-server while the built app points at MockAPI.io, without changing a line of code. `updateCustomer`'s `PUT` request and `fetchInteractions`'s `response.ok` check from Part 3 still behave correctly against json-server: json-server accepts `PUT` the same way it accepts `PATCH`, and it already returns `200` with `[]` for a `?customerId=` filter that matches nothing, so that branch simply never triggers in development.

> Vite only reads `.env` files once, when it starts. If you edit `.env.development` while `npm run dev` is already running, the dev server keeps using the old value, since it does not watch `.env` files for changes the way it watches your source code. Stop the server (`Ctrl+C`) and run `npm run dev` again after every `.env` edit.

> `.env.production` only matters for a production build you run yourself, `npm run build` on your own machine, which is what the browser check below does. It never reaches Netlify: the file is gitignored, so Netlify's build machine never sees it. When you deploy in Part 5, Netlify runs its own `npm run build` on its own servers and injects `VITE_API_BASE_URL` directly through its dashboard instead. Vite reads that variable the same way, `import.meta.env.VITE_API_BASE_URL`, but the value comes from Netlify's configuration, not from `.env.production`. Keep `.env.production` around anyway: it lets you test a production build locally before you ever touch Netlify.

### The VITE_ Prefix

Vite only exposes variables prefixed with `VITE_` to your client-side code. Variables without this prefix are available at build time but are never included in the browser bundle. This prevents accidentally leaking server-only secrets (database passwords, private API keys) into the JavaScript your users can download.

Access the variable in your components using `import.meta.env`.

### Update App.jsx

Replace the hardcoded MockAPI.io URL in `src/App.jsx` with the environment variable:

```jsx
// src/App.jsx
export const API_BASE = import.meta.env.VITE_API_BASE_URL;
```

Every file that imports `API_BASE` from `App.jsx` (`CustomerContext.jsx`, `CustomerDetailPage.jsx`, `AddInteractionForm.jsx`, and any others) now reads the environment variable automatically. There is nothing else to change.

### Show the Current Environment in the Sidebar

`import.meta.env` carries more than the variables you define yourself. Vite also sets `import.meta.env.MODE` to `"development"` when running `npm run dev` and `"production"` when running `npm run build`, and it sets `import.meta.env.DEV` and `import.meta.env.PROD` as the same information in boolean form. This is a convenient way to make the running environment visible on screen instead of only in the Network tab.

Add the badge inside `.footWho`, below `.footName`:

```jsx
// src/components/Sidebar.jsx
<div className={styles.footWho}>
  <div className={styles.footName}>{user.name}</div>
  <span
    className={`${styles.roleBadge} ${user.role === "admin" ? styles.roleBadgeAdmin : styles.roleBadgeUser}`}
  >
    {user.role}
  </span>
  <span
    className={`${styles.roleBadge} ${
      import.meta.env.DEV ? styles.roleBadgeUser : styles.roleBadgeAdmin
    }`}
  >
    {import.meta.env.MODE}
  </span>
</div>
```

This reuses the same `.roleBadge` classes already defined for the user's role, so no new CSS is needed. The badge text reads `MODE` because it needs the string `"development"` or `"production"` to display, while the class decision uses the `DEV` boolean since it only needs a true/false check. Both are read automatically by Vite; you never set either yourself in an `.env` file.

While you are here, add a `console.log` that only fires in development:

```jsx
// src/components/Sidebar.jsx
if (import.meta.env.DEV) {
  console.log("API_BASE:", import.meta.env.VITE_API_BASE_URL);
}
```

`import.meta.env.DEV` is a boolean Vite sets to `true` in development and `false` in a production build; `import.meta.env.PROD` is its exact opposite. Wrapping a log this way is a common pattern for leaving debugging information in place for development without shipping it to every user who opens the deployed site.

**Browser check:** With `npm run dev` running, the sidebar footer should show a `development` badge, and the browser console should print the `API_BASE` value pointing at `localhost:3001`. Run `npm run build` followed by `npm run preview`: the badge should now read `production`, and the console log should not appear at all, since the `if` block was for development only.

### Add the Files to .gitignore

Open `.gitignore` at the project root and add:

```
.env*
!.env.example
```

`.env*` ignores every file starting with `.env`, `.env.development`, `.env.production`, `.env.local`, and any others you add later, so you never have to remember to update `.gitignore` again when a new one shows up. The `!.env.example` line is an exception: it un-ignores that one file so it stays tracked in Git.

Create `.env.example` alongside the other two files, listing the variable names with placeholder values instead of real ones:

```
# .env.example
VITE_API_BASE_URL=
```

`.env.example` documents which variables the app expects without exposing any real URLs or keys. A new developer cloning the repository copies it to `.env.development`, fills in the real value, and knows exactly what to configure without reading through the source code.

> This step matters most when your `.env` files contain secrets like private API keys. The MockAPI.io URL is not a secret, but adopting this habit now protects you when you work with real credentials later.

**Browser check:** Make sure json-server is still running (`npx json-server --watch data/db.json --port 3001` in a separate terminal, if you had stopped it), then restart the dev server (`Ctrl+C`, then `npm run dev`). Open the Network tab and confirm requests go to `localhost:3001`, the customer list should show the same data from `data/db.json` you have been using since Part 1. Now run `npm run build` followed by `npm run preview`, and check the Network tab again: requests now go to the mockapi.io domain, and the customer list shows the data you added in Part 3. Same code, two different backends, selected entirely by which `.env` file Vite loaded.

---

## Part 5: Deploy to Netlify (25 minutes)

### Push the Project to GitHub

Netlify deploys from a Git repository. If your CRM project is not already on GitHub, set it up now:

```bash
cd simple-crm-web
git init
git add .
git commit -m "Initial commit"
```

Then create a new repository on GitHub (from the GitHub website) and push:

```bash
git remote add origin https://github.com/YOUR-USERNAME/simple-crm-web.git
git branch -M main
git push -u origin main
```

> Confirm that `.gitignore` includes your `.env` files before pushing. The commit should not contain `.env.development` or `.env.production`.

### Create a Netlify Site

1. Log in to [https://netlify.com](https://netlify.com). If you do not have an account, sign up with **GitHub** rather than an email and password; this links the two accounts immediately and skips a separate authorisation step later.
2. Click **Add new site** > **Import an existing project**.
3. Choose **GitHub** as the Git provider. If you signed up with GitHub in step 1, your repositories are already accessible; otherwise, authorise Netlify to access them now.
4. Select the `simple-crm-web` repository.
5. Set the build settings:

   | Setting | Value |
   |---------|-------|
   | Build command | `npm run build` |
   | Publish directory | `dist` |

6. Do **not** click Deploy yet.

### Set the Environment Variable in Netlify

Netlify injects environment variables at build time, so Vite can read them when it compiles the app. You must add `VITE_API_BASE_URL` before the first build.

`.env.production` never leaves your machine; it is gitignored, so nothing in it reaches Netlify. Netlify's own build runs on Netlify's servers with none of your local `.env` files present, so the variable has to be entered here instead.

1. On the same page, scroll down to **Environment variables**.
2. Click **Add variable**.
3. Set:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://YOUR-PROJECT-ID.mockapi.io/api/v1`

Now click **Deploy site**.

### Wait for the Build

Netlify clones your repo, runs `npm run build`, and publishes the `dist` folder. This takes about one to two minutes. Watch the build log; it should end with a green "Published" status.

Once the build completes, Netlify assigns a URL like `https://jolly-coder-abc123.netlify.app`. Click it.

**Browser check, full flow:**

1. The customer list loads from MockAPI.io.
2. Click a customer to reach the detail page.
3. Fill in the interaction form and submit.
4. The new interaction appears in the Interaction History list on the page.
5. Check MockAPI.io's data table for the `interactions` resource; the new record should be there too.
6. Copy the customer detail page's URL directly out of the address bar and open it in a new tab.

> If the API calls fail on the live site, the most common cause is that `VITE_API_BASE_URL` was not set before the build. Go to **Site settings > Environment variables**, add the variable, then go to **Deploys** and click **Trigger deploy > Deploy site** to rebuild.

Step 6 should fail: Netlify responds with a "Page not found" error instead of the customer detail page, even though the exact same URL worked fine when you clicked to it from inside the app.

### Fix the SPA Redirect

The CRM is a single-page application: `dist/` contains one `index.html`, and React Router handles a path like `/app/customers/3` entirely in the browser, without a matching file on disk for that path. Clicking a link to it from inside the running app works, since React Router intercepts the click and never asks the server for that path at all. Opening it directly does not: the browser asks Netlify's server for `/app/customers/3` by name, no such file exists in `dist/`, and Netlify returns a 404 before React ever loads.

Fix this by adding a redirect rule that sends every path back to `index.html`, letting React Router take over from there. Create `public/_redirects` (no file extension):

```
# public/_redirects
/*  /index.html  200
```

Files in `public/` are copied into `dist/` unchanged during `npm run build`, so this rule ships with every future deploy. Commit and push it:

```bash
git add public/_redirects
git commit -m "Add SPA redirect for Netlify"
git push
```

This push triggers the same automatic rebuild you are about to see formally in Continuous Deployment below. Once it finishes, repeat step 6 from the browser check above; the customer detail page should now load directly.

### Continuous Deployment

Every push to the `main` branch automatically triggers a new build. Try it now:

1. Make a small visible change, for example, update the page heading in `CustomersPage.jsx` from `"Customers"` to `"Customer Directory"`.
2. Commit and push:
   ```bash
   git add src/pages/CustomersPage.jsx
   git commit -m "Update customer list heading"
   git push
   ```
3. Watch the Netlify dashboard. A new build should start within seconds and finish in about a minute.
4. Refresh the live URL and confirm the change is visible.

---

## Optional Reading: Formik

The five parts above already fill the lab's time budget, so this section is not meant to be coded along in class. Read it on your own time, no installation or typing required, to see how a form library like Formik removes the per-field boilerplate from `AddInteractionForm.jsx`.

### What Formik Adds

Right now the form manages its own `formData` state with `useState`, one `handleChange` that spreads updates into the state object, and a `handleBlur` that validates on the fly. For three fields this is manageable. For a ten-field form, the pattern is repetitive.

Formik handles all of that automatically. You give it initial values and a `validationSchema`; it manages field state, touched tracking, and error display:

```bash
npm install formik
```

```jsx
// src/components/AddInteractionForm.jsx
import { useFormik } from "formik";
import * as yup from "yup";
import { API_BASE } from "../App";
import styles from "./AddInteractionForm.module.css";

const interactionSchema = yup.object().shape({
  type: yup.string().required("Interaction type is required"),
  notes: yup.string().required("Notes are required.").min(10, "Notes must be at least 10 characters."),
  date: yup
    .date()
    .typeError("Date is required.")
    .required("Date is required.")
    .max(new Date(), "Date cannot be in the future."),
});

function AddInteractionForm({ customerId, onSuccess }) {
  const formik = useFormik({
    initialValues: {
      type: "call",
      notes: "",
      date: new Date().toISOString().split("T")[0],
    },
    validationSchema: interactionSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const res = await fetch(`${API_BASE}/interactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, customerId }),
        });
        if (!res.ok) throw new Error("Failed to save interaction");
        const savedInteraction = await res.json();
        resetForm();
        onSuccess(savedInteraction);
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className={styles.form}>
      <h3 className={styles.heading}>Log Interaction</h3>

      <div className={styles.field}>
        <label htmlFor="type">Type</label>
        <select id="type" disabled={formik.isSubmitting} {...formik.getFieldProps("type")}>
          <option value="call">Phone Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          rows={3}
          placeholder="What was discussed?"
          disabled={formik.isSubmitting}
          {...formik.getFieldProps("notes")}
        />
        {formik.touched.notes && formik.errors.notes && (
          <p className={styles.fieldError}>{formik.errors.notes}</p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          disabled={formik.isSubmitting}
          {...formik.getFieldProps("date")}
        />
        {formik.touched.date && formik.errors.date && (
          <p className={styles.fieldError}>{formik.errors.date}</p>
        )}
      </div>

      <button type="submit" className={styles.submitButton} disabled={formik.isSubmitting}>
        {formik.isSubmitting ? "Saving..." : "Log Interaction"}
      </button>
    </form>
  );
}
```

**What changed compared to the manual version:**

- There is no `useState` for `formData`, `submitting`, or `errors`
- `formik.getFieldProps('notes')` returns `{ name, value, onChange, onBlur }`, all four attributes in one spread
- `formik.touched.notes` is only `true` after the user has focused and left the field, so errors do not appear before the user has had a chance to type
- `resetForm()` clears all fields and touched state in a single call

> The Yup schema (`interactionSchema`) did not change. Formik accepts it directly via `validationSchema`. This illustrates the separation of concerns: Yup owns the validation rules, Formik owns the form state, and the component owns the layout.

---

## Bonus Challenges

These challenges have no provided solution. They are for learners who finish the lab early.

### Challenge 1: Delete an Interaction

Add a Delete button on each item in the Interaction History list. It should call `DELETE /interactions/:interactionId` and remove the interaction from the UI without a full page refresh.

### Challenge 2: Clear Errors While Typing

Right now, once a field fails validation on blur, its error message stays on screen for the entire time the user is typing, it only updates the next time the field blurs. Update `handleChange` (in `AddInteractionForm`, `NewCustomerPage`, or both) to clear that field's error as soon as the user starts editing it again, before they blur or submit.

### Challenge 3: Reject Very Old Dates

`interactionSchema` already rejects future dates with `.max()`. Add a `.min()` rule that rejects dates more than one year in the past, with the message `'Date cannot be more than a year ago.'`. You will need to construct a `Date` one year before today to pass to `.min()`.

### Challenge 4: Sort the Interaction List

Sort the Interaction History list so the most recent interaction appears first, without relying on the order MockAPI.io returns records in.

### Challenge 5: Deploy to GitHub Pages

As an alternative to Netlify, deploy the app to GitHub Pages:

1. Install `gh-pages` as a dev dependency: `npm install --save-dev gh-pages`
2. Add a `homepage` field and `predeploy`/`deploy` scripts to `package.json`
3. Add `base: '/REPO-NAME/'` to `vite.config.js` so asset paths resolve correctly under a sub-path
4. Run `npm run deploy`

Consider how GitHub Pages handles environment variables differently from Netlify. There is no dashboard to set `VITE_API_BASE_URL` at build time, so you would need to commit a `.env.production` file or set up a GitHub Actions workflow with repository secrets.

---

## Summary

| Concept | What it does |
|---------|-------------|
| `customerId` on interactions | Links an interaction to its customer in a non-relational data store; queried with `?customerId=` instead of a join |
| Controlled form | `value` and `onChange` on every field; React owns all form state |
| Manual validation | `if` checks in `handleSubmit` and `onBlur`; simple but must be maintained in multiple places |
| Yup schema | Defines all rules in one place; `validate()` collects all errors; `validateAt()` checks one field at a time |
| `abortEarly: false` | Collects all Yup errors from a single `validate()` call instead of stopping at the first failure |
| `.typeError()` | Overrides Yup's generic cast-failure message, e.g. when an empty date field cannot be parsed |
| `.email()` | Checks that a string field is a validly formatted email address |
| Reapplying a schema pattern | The same `handleChange`/`handleBlur`/`handleSubmit` shape from `AddInteractionForm` applies to any form; only the schema and field names change |
| MockAPI.io | Hosts a REST API at a public URL so the app works after deployment |
| `VITE_` prefix | Makes a build-time variable available in client-side code via `import.meta.env` |
| `.env.development` | Variable values used by Vite during `npm run dev`; points the CRM at local json-server |
| `.env.production` | Variable values used by Vite during `npm run build`; points the CRM at MockAPI.io |
| Netlify | Hosts the built `dist` folder; injects environment variables at build time |
| Continuous deployment | Every push to `main` triggers an automatic rebuild and redeploy on Netlify |

---

## Additional Resources

- [Yup: GitHub](https://github.com/jquense/yup)
- [Formik: Official Documentation](https://formik.org/docs/overview)
- [Netlify: Getting Started](https://docs.netlify.com/get-started/)
- [Vite: Environment Variables and Modes](https://vitejs.dev/guide/env-and-mode)
