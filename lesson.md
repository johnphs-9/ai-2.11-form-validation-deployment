# Lesson 2.11: Form Handling, Validation, and Deployment

## Overview

- **Duration:** ~2 hours (hands-on lab)
- **Prerequisites:** Lesson 2.8 — Routing and Navigation with React Router

## Learning Objectives

By the end of this lesson, you will be able to:

1. **Build** a controlled form in React and handle submission with client-side validation
2. **Apply** a Yup schema to validate form input and display field-level error messages
3. **Deploy** a React application to Netlify using environment variables for configuration

## Introduction

At the end of Lesson 2.8, your CRM had multiple pages, protected routes, and programmatic navigation. All its data came from a local json-server running on your machine. That works perfectly for development, but it cannot be deployed: json-server is a local process, not a hosted service. Once you push your app to the internet, there is no server to answer API requests.

In this lesson you will solve that problem and extend the CRM at the same time. You will connect the app to a hosted mock API, add a form for logging customer interactions, apply professional-grade validation with Yup, and then deploy the finished app to Netlify so anyone can open it in a browser.

By the end of the lab, a user can open the live URL, view the customer list loaded from MockAPI.io, navigate to a customer detail page, and log an interaction with validated input.

---

## Part 1: Replace json-server with MockAPI.io (20 minutes)

### Why json-server Cannot Deploy

Your CRM currently fetches data from `http://localhost:3001`. That address only exists on your machine. When the same code runs on Netlify's servers (or in a user's browser after deployment), there is no process listening on port 3001 and every request fails.

MockAPI.io solves this by hosting a REST API at a public URL. The API contract is identical to json-server: the same `GET /customers`, `POST /customers`, and `DELETE /customers/:id` endpoints. Only the base URL changes.

### Create a MockAPI.io Project

1. Go to [https://mockapi.io](https://mockapi.io) and create a free account.
2. Click **New Project** and give it a name (for example, `simple-crm`).
3. Click **New Resource** and name it `customers`. Add the following fields:

   | Field name | Type |
   |------------|------|
   | `firstName` | String |
   | `lastName` | String |
   | `email` | String |
   | `contactNo` | String |
   | `jobTitle` | String |
   | `yearOfBirth` | Number |

4. Click the **Generate** button (the lightning bolt icon) to seed some sample data. Aim for 5 to 10 records.
5. Click **New Resource** again and name it `interactions`. Add these fields:

   | Field name | Type |
   |------------|------|
   | `customerId` | String |
   | `type` | String |
   | `notes` | String |
   | `date` | String |

6. Copy the base URL shown at the top of the project page. It looks like:
   ```
   https://64f1a2b3c5b4b.mockapi.io/api/v1
   ```

> MockAPI.io free accounts are limited to one project and two resources. The `customers` and `interactions` resources are exactly what you need for this lesson.

### Connect the CRM to MockAPI.io

Open `src/contexts/CustomerContext.jsx`. Near the top, find the hardcoded URL pointing to `http://localhost:3001` and replace it:

```jsx
// src/contexts/CustomerContext.jsx
const API_BASE = 'https://YOUR-PROJECT-ID.mockapi.io/api/v1';
```

Do the same in `src/pages/CustomerDetail.jsx` wherever the URL appears. For now, replace the URL directly in the source. You will move it to an environment variable in Part 4.

**Browser check:** Start the dev server with `npm run dev`. The customer list page should now load data from MockAPI.io. Open the Network tab in your browser dev tools and confirm the requests are going to the mockapi.io domain, not localhost.

> If the customer list is empty, go back to MockAPI.io and verify you clicked Generate to seed data. You can also add records manually using the MockAPI.io data table.

---

## Part 2: Build the Add Interaction Form (30 minutes)

### The Feature

A CRM's core purpose is tracking communication with customers. In this part you will add a form to the customer detail page that lets a user log a new interaction: a phone call, an email, or a meeting.

### Create the AddInteractionForm Component

Create a new file `src/components/AddInteractionForm.jsx`:

```jsx
// src/components/AddInteractionForm.jsx
import { useState } from 'react';

const API_BASE = 'https://YOUR-PROJECT-ID.mockapi.io/api/v1';

const EMPTY_FORM = {
  type: 'call',
  notes: '',
  date: new Date().toISOString().split('T')[0],
};

function AddInteractionForm({ customerId, onSuccess }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, customerId }),
      });
      if (!res.ok) throw new Error('Failed to save interaction');
      setFormData(EMPTY_FORM);
      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="interaction-form">
      <h3>Log Interaction</h3>

      <div className="form-group">
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

      <div className="form-group">
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
        {errors.notes && <p className="field-error">{errors.notes}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          disabled={submitting}
        />
        {errors.date && <p className="field-error">{errors.date}</p>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Saving...' : 'Log Interaction'}
      </button>
    </form>
  );
}

export default AddInteractionForm;
```

Add the form to `CustomerDetail.jsx` by importing and rendering it below the customer info card:

```jsx
// src/pages/CustomerDetail.jsx
import AddInteractionForm from '../components/AddInteractionForm';

// Inside the return block, after the customer-info-card div:
<AddInteractionForm
  customerId={id}
  onSuccess={() => console.log('Interaction saved')}
/>
```

**Browser check:** Navigate to a customer detail page. The "Log Interaction" form should appear below the customer info. Fill it in and submit. Open MockAPI.io's data table for the `interactions` resource and confirm a new record appeared.

### Add Manual Validation

Right now the form submits even with an empty Notes field. Add basic validation to `handleSubmit` and an `onBlur` handler on the textarea:

```jsx
function handleBlur(e) {
  const { name, value } = e.target;
  if (name === 'notes' && value.trim() === '') {
    setErrors(prev => ({ ...prev, notes: 'Notes are required.' }));
  } else {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  if (formData.notes.trim() === '') {
    setErrors({ notes: 'Notes are required.' });
    return;
  }
  if (!formData.date) {
    setErrors({ date: 'Date is required.' });
    return;
  }

  setSubmitting(true);
  // ... rest of submit logic
}
```

Add `onBlur={handleBlur}` to the textarea element.

**Browser check:** Submit with an empty Notes field. The error message should appear below the textarea. Type something in the field and click away — the error should clear.

> Notice the problem: the validation logic is written twice, once in `handleSubmit` and once in `handleBlur`. If you add a new rule (say, notes must be at least 10 characters), you must update both places. For two fields this is manageable. For a form with eight fields and multiple rules each, this approach becomes a maintenance burden.

---

## Activity: Add a Minimum Length Rule (10 minutes)

Using the same manual approach, add a second validation rule: the Notes field must contain at least 10 characters (after trimming whitespace).

**Task:** Update both `handleBlur` and `handleSubmit` so that:

1. Submitting with fewer than 10 characters shows the error: `"Notes must be at least 10 characters."`
2. Blurring the field with fewer than 10 characters shows the same message
3. The error clears when the field has 10 or more characters

**Hints:**

1. You need to check both `value.trim() === ''` and `value.trim().length < 10`. Which check should come first?
2. A single `notes` key in the `errors` state object is enough — just update it to the appropriate message.
3. To clear the error, set the key back to an empty string `''` and render it as `{errors.notes && <p>...</p>}` so nothing renders when the string is empty.
4. Try submitting with exactly 9 characters, then 10. Does the error appear and clear at the right point?

<details>
<summary>Reference solution</summary>

Extract a shared helper to avoid duplicating the logic:

```jsx
function validateNotes(value) {
  if (value.trim() === '') return 'Notes are required.';
  if (value.trim().length < 10) return 'Notes must be at least 10 characters.';
  return '';
}

function handleBlur(e) {
  const { name, value } = e.target;
  if (name === 'notes') {
    setErrors(prev => ({ ...prev, notes: validateNotes(value) }));
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const notesError = validateNotes(formData.notes);
  const dateError = formData.date ? '' : 'Date is required.';
  if (notesError || dateError) {
    setErrors({ notes: notesError, date: dateError });
    return;
  }
  // ... proceed with submission
}
```

Extracting `validateNotes` removes most of the duplication. Notice that this pattern — a standalone validator function per field — is exactly what Yup formalises into a schema. You just built a miniature version of it.

</details>

---

## Part 3: Replace Manual Validation with Yup (25 minutes)

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
import * as yup from 'yup';

const interactionSchema = yup.object().shape({
  type: yup.string().required('Interaction type is required'),
  notes: yup
    .string()
    .required('Notes are required.')
    .min(10, 'Notes must be at least 10 characters.'),
  date: yup.string().required('Date is required.'),
});
```

Each method in the chain is a rule. `.required()` checks that the field is not empty. `.min(10, ...)` checks the minimum string length. The string argument becomes the error message when that rule fails.

### Validate on Submit

Replace the manual `if` checks in `handleSubmit` with a single `schema.validate()` call:

```jsx
async function handleSubmit(e) {
  e.preventDefault();

  try {
    await interactionSchema.validate(formData, { abortEarly: false });
  } catch (err) {
    const fieldErrors = {};
    err.inner.forEach(validationError => {
      fieldErrors[validationError.path] = validationError.message;
    });
    setErrors(fieldErrors);
    return;
  }

  setSubmitting(true);
  try {
    const res = await fetch(`${API_BASE}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, customerId }),
    });
    if (!res.ok) throw new Error('Failed to save interaction');
    setErrors({});
    setFormData(EMPTY_FORM);
    onSuccess();
  } catch (err) {
    alert(err.message);
  } finally {
    setSubmitting(false);
  }
}
```

`{ abortEarly: false }` tells Yup to collect all failures instead of stopping at the first one. When the form is submitted empty, all missing-field errors appear at once.

`err.inner` is an array of `ValidationError` objects — one per failed field. Each has a `.path` (the field name, matching the key in `formData`) and a `.message` (the string you wrote in the schema).

### Validate on Blur with validateAt

Replace `handleBlur` with a Yup-powered version that validates a single field:

```jsx
async function handleBlur(e) {
  const { name, value } = e.target;
  try {
    await interactionSchema.validateAt(name, { ...formData, [name]: value });
    setErrors(prev => ({ ...prev, [name]: '' }));
  } catch (err) {
    setErrors(prev => ({ ...prev, [name]: err.message }));
  }
}
```

`validateAt(fieldName, values)` runs only the rules for the named field. If it throws, `err.message` is the first failing rule for that field. Add `onBlur={handleBlur}` to the textarea and the date input.

**Browser check:**

1. Submit the form with all fields empty. Both the notes and date errors should appear at once.
2. Type 5 characters in Notes and click away. The minimum-length error should appear immediately.
3. Type 5 more characters and click away again. The error should clear.
4. Fill the form correctly and submit. The form should reset and the console should log `"Interaction saved"`.

> The schema is now the single source of truth for validation rules. To change the minimum length from 10 to 20, you edit one line in `interactionSchema`. The component code does not change.

---

## Part 4: Environment Variables (10 minutes)

### The Problem with Hardcoded URLs

Right now the MockAPI.io base URL appears in multiple source files. Every time you need to point the app at a different API (a test server, a staging environment, the production endpoint), you must find and update every occurrence.

Environment variables solve this. You define the URL once in a configuration file, and every file reads it from there. Switching environments means editing one file, not hunting through source code.

### Create Environment Files

Create two files in the root of `simple-crm-web/` (the same folder as `package.json`):

**.env.development**

```
VITE_API_BASE_URL=https://YOUR-PROJECT-ID.mockapi.io/api/v1
```

**.env.production**

```
VITE_API_BASE_URL=https://YOUR-PROJECT-ID.mockapi.io/api/v1
```

For this lesson both files use the same MockAPI.io URL. In a real project, `.env.development` might point to a local or staging server while `.env.production` points to the live API.

### The VITE_ Prefix

Vite only exposes variables prefixed with `VITE_` to your client-side code. Variables without this prefix are available at build time but are never included in the browser bundle. This prevents accidentally leaking server-only secrets (database passwords, private API keys) into the JavaScript your users can download.

Access the variable in your components using `import.meta.env`:

```jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL;
```

### Update the Source Files

Replace every hardcoded MockAPI.io URL string with `import.meta.env.VITE_API_BASE_URL`:

In `src/contexts/CustomerContext.jsx`:

```jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL;
```

In `src/pages/CustomerDetail.jsx`:

```jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL;
```

In `src/components/AddInteractionForm.jsx`:

```jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL;
```

### Add the Files to .gitignore

Open `.gitignore` at the project root and add:

```
.env.development
.env.production
.env.local
```

> This step matters most when your `.env` files contain secrets like private API keys. The MockAPI.io URL is not a secret, but adopting this habit now protects you when you work with real credentials later.

**Browser check:** Restart the dev server (`Ctrl+C`, then `npm run dev`). The app should still load data and the interaction form should still submit. As a quick test, add a deliberate typo to the URL in `.env.development`, restart, and confirm the customer list fails to load. Fix the typo and restart to confirm it reads from the file correctly.

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

1. Log in to [https://netlify.com](https://netlify.com). Create a free account if you do not have one.
2. Click **Add new site** > **Import an existing project**.
3. Choose **GitHub** as the Git provider and authorise Netlify to access your repositories.
4. Select the `simple-crm-web` repository.
5. Set the build settings:

   | Setting | Value |
   |---------|-------|
   | Build command | `npm run build` |
   | Publish directory | `dist` |

6. Do **not** click Deploy yet.

### Set the Environment Variable in Netlify

Netlify injects environment variables at build time, so Vite can read them when it compiles the app. You must add `VITE_API_BASE_URL` before the first build.

1. On the same page, scroll down to **Environment variables**.
2. Click **Add variable**.
3. Set:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://YOUR-PROJECT-ID.mockapi.io/api/v1`

Now click **Deploy site**.

### Wait for the Build

Netlify clones your repo, runs `npm run build`, and publishes the `dist` folder. This takes about one to two minutes. Watch the build log — it should end with a green "Published" status.

Once the build completes, Netlify assigns a URL like `https://jolly-coder-abc123.netlify.app`. Click it.

**Browser check — full flow:**

1. The customer list loads from MockAPI.io.
2. Click a customer to reach the detail page.
3. Fill in the interaction form and submit.
4. Check MockAPI.io's data table for the `interactions` resource — the new record should be there.

> If the API calls fail on the live site, the most common cause is that `VITE_API_BASE_URL` was not set before the build. Go to **Site settings > Environment variables**, add the variable, then go to **Deploys** and click **Trigger deploy > Deploy site** to rebuild.

### Continuous Deployment

Every push to the `main` branch automatically triggers a new build. Try it now:

1. Make a small visible change — for example, update the page title in `CustomerList.jsx` from `"Customers"` to `"Customer Directory"`.
2. Commit and push:
   ```bash
   git add src/pages/CustomerList.jsx
   git commit -m "Update customer list heading"
   git push
   ```
3. Watch the Netlify dashboard. A new build should start within seconds and finish in about a minute.
4. Refresh the live URL and confirm the change is visible.

---

## Optional Extension: Formik (time permitting)

If you have finished all five parts and have 10 or more minutes remaining, this extension shows how a form library like Formik removes the per-field boilerplate from `AddInteractionForm.jsx`.

### What Formik Adds

Right now the form manages its own `formData` state with `useState`, one `handleChange` that spreads updates into the state object, and a `handleBlur` that validates on the fly. For three fields this is manageable. For a ten-field form, the pattern is repetitive.

Formik handles all of that automatically. You give it initial values and a `validationSchema`; it manages field state, touched tracking, and error display:

```bash
npm install formik
```

```jsx
// src/components/AddInteractionForm.jsx
import { useFormik } from 'formik';
import * as yup from 'yup';

const interactionSchema = yup.object().shape({
  type: yup.string().required('Interaction type is required'),
  notes: yup.string().required('Notes are required.').min(10, 'Notes must be at least 10 characters.'),
  date: yup.string().required('Date is required.'),
});

function AddInteractionForm({ customerId, onSuccess }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const formik = useFormik({
    initialValues: {
      type: 'call',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    },
    validationSchema: interactionSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const res = await fetch(`${API_BASE}/interactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, customerId }),
        });
        if (!res.ok) throw new Error('Failed to save interaction');
        resetForm();
        onSuccess();
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="interaction-form">
      <h3>Log Interaction</h3>

      <div className="form-group">
        <label htmlFor="type">Type</label>
        <select id="type" disabled={formik.isSubmitting} {...formik.getFieldProps('type')}>
          <option value="call">Phone Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          rows={3}
          placeholder="What was discussed?"
          disabled={formik.isSubmitting}
          {...formik.getFieldProps('notes')}
        />
        {formik.touched.notes && formik.errors.notes && (
          <p className="field-error">{formik.errors.notes}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          disabled={formik.isSubmitting}
          {...formik.getFieldProps('date')}
        />
        {formik.touched.date && formik.errors.date && (
          <p className="field-error">{formik.errors.date}</p>
        )}
      </div>

      <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
        {formik.isSubmitting ? 'Saving...' : 'Log Interaction'}
      </button>
    </form>
  );
}
```

**What changed compared to the manual version:**

- There is no `useState` for `formData`, `submitting`, or `errors`
- `formik.getFieldProps('notes')` returns `{ name, value, onChange, onBlur }` — all four attributes in one spread
- `formik.touched.notes` is only `true` after the user has focused and left the field, so errors do not appear before the user has had a chance to type
- `resetForm()` clears all fields and touched state in a single call

> The Yup schema (`interactionSchema`) did not change. Formik accepts it directly via `validationSchema`. This illustrates the separation of concerns: Yup owns the validation rules, Formik owns the form state, and the component owns the layout.

---

## Bonus Challenges

These challenges have no provided solution. They are for learners who finish the lab early.

### Challenge 1: Load and Display Interactions

Add a `GET` call to `CustomerDetail.jsx` that fetches all interactions for the current customer and displays them in a list below the form. MockAPI.io supports filtering with query parameters: `GET /interactions?customerId=:id`.

### Challenge 2: Delete an Interaction

Add a Delete button on each displayed interaction. It should call `DELETE /interactions/:interactionId` and remove the interaction from the UI without a full page refresh.

### Challenge 3: Validate the Date Field

Add a Yup rule to `interactionSchema` that rejects dates in the future. Switch the `date` field from `yup.string()` to `yup.date()` and chain `.max(new Date(), 'Date cannot be in the future.')`.

### Challenge 4: Deploy to GitHub Pages

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
| MockAPI.io | Hosts a REST API at a public URL so the app works after deployment |
| Controlled form | `value` and `onChange` on every field; React owns all form state |
| Manual validation | `if` checks in `handleSubmit` and `onBlur`; simple but must be maintained in multiple places |
| Yup schema | Defines all rules in one place; `validate()` collects all errors; `validateAt()` checks one field at a time |
| `abortEarly: false` | Collects all Yup errors from a single `validate()` call instead of stopping at the first failure |
| `VITE_` prefix | Makes a build-time variable available in client-side code via `import.meta.env` |
| `.env.development` | Variable values used by Vite during `npm run dev` |
| `.env.production` | Variable values used by Vite during `npm run build` |
| Netlify | Hosts the built `dist` folder; injects environment variables at build time |
| Continuous deployment | Every push to `main` triggers an automatic rebuild and redeploy on Netlify |

---

## Additional Resources

- [Yup — GitHub](https://github.com/jquense/yup)
- [Formik — Official Documentation](https://formik.org/docs/overview)
- [Netlify — Getting Started](https://docs.netlify.com/get-started/)
- [Vite — Environment Variables and Modes](https://vitejs.dev/guide/env-and-mode)
