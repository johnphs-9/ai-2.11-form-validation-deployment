# Pre-Reading: Lesson 2.11, Form Handling, Validation, and Deployment

Timebox **1.5–2 hours** across these resources before the lesson. You do not need to read every linked page in full detail; the goal is to arrive with a mental model of controlled forms, validation schemas, and how a Vite app gets built and deployed.

---

## 1. Controlled Forms in React

**Read (15 min)**

- [React Docs: Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state): Read the full page. Pay attention to how the component re-renders on every keystroke and how `value` and `onChange` work together to keep the UI in sync with state.

**Key idea to take away:** In a controlled form, React owns the current value of every field. The input does not store its own value — it only displays what React tells it to. This is different from a plain HTML form, where the browser owns the value.

**Quick check:** Can you write a text input whose value is stored in `useState` and clears when the user presses Escape? If not, revisit this section before the lesson.

---

## 2. Form Submission and Preventing the Default

**Read (5 min)**

- [MDN: HTMLFormElement: submit event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event): Read the short overview. The key point is that a form's default submit behaviour is to send an HTTP request and reload the page. In a React SPA you always call `e.preventDefault()` to stop this.

**Key idea to take away:** `e.preventDefault()` is not optional in React form handlers. Without it, the browser sends a GET or POST request to the current URL and the page reloads, destroying all your React state.

---

## 3. Client-Side Validation

**Read (15 min)**

- [web.dev: Learn Forms — Validation](https://web.dev/learn/forms/validation): Read the "Constraint validation API" and "Custom validation" sections. Skim the rest. This gives you a picture of what the browser provides natively (the `required`, `minlength`, and `pattern` attributes) and why custom validation in JavaScript is still needed for richer rules and better error messages.

**Key idea to take away:** Native HTML validation (`required`, `minlength`) is useful but limited. It cannot express rules like "this field is required only if another field has a certain value", and it gives you no control over where or how the error message is displayed. Custom JavaScript validation fills that gap.

---

## 4. Yup — Schema Validation

**Read (15 min)**

- [Yup README on GitHub](https://github.com/jquense/yup): Read the Introduction and the "Object Schema" section. You do not need to read the full API reference; focus on how `.object().shape()`, `.string()`, `.required()`, and `.min()` work together, and what `abortEarly: false` does.

**Key ideas:**

- A Yup schema is a plain JavaScript object that describes valid data
- `.validate(values)` returns a promise that resolves if all rules pass or rejects with a `ValidationError` if any fail
- `abortEarly: false` collects all errors in one pass rather than stopping at the first failure
- `err.inner` is an array of individual `ValidationError` objects, one per failing field

**Quick check:** Can you write a Yup schema that validates an object with an `email` field (required, must be a valid email format) and an `age` field (required, must be a positive integer)? Try it in a browser console or a quick CodeSandbox.

---

## 5. Environment Variables in Vite

**Read (10 min)**

- [Vite Docs: Env Variables and Modes](https://vitejs.dev/guide/env-and-mode): Read the "Env Variables" and ".env Files" sections.

**Key ideas:**

- Vite reads `.env`, `.env.development`, and `.env.production` files at build time
- Only variables prefixed with `VITE_` are included in the browser bundle
- Variables are accessed in client code via `import.meta.env.VITE_VARIABLE_NAME`
- Variables without the prefix are available to build tooling but are never embedded in the output JavaScript

**Key idea to take away:** The `VITE_` prefix is a safety guardrail. Without it, you could accidentally bundle a server secret (a database password, a private API key) into the JavaScript file that every user downloads.

---

## 6. Deploying to Netlify

**Read (15 min)**

- [Netlify Docs: Get Started](https://docs.netlify.com/get-started/): Read "Step 1: Set up Netlify" and "Step 2: Add your site". You can skip account creation for now — you will do it in the lesson. Focus on understanding the build settings (build command and publish directory) and how Netlify connects to a GitHub repository.

**Key ideas:**

- Netlify clones your GitHub repository, runs your build command (`npm run build`), and serves the output folder (`dist`) as a static site
- Every push to the configured branch triggers a new build automatically
- Environment variables are set in the Netlify dashboard and injected at build time, not at runtime

**Quick check:** What is the difference between setting an environment variable in Netlify's dashboard versus committing a `.env.production` file to the repository? Think about security and the deployment workflow.

---

## 7. What is MockAPI.io

**Browse (5 min)**

- [MockAPI.io](https://mockapi.io): Spend five minutes on the homepage and the quick-start guide. You do not need to create an account yet — you will do that in the lesson. The goal is to understand that MockAPI.io gives you a hosted REST API (GET, POST, DELETE endpoints) without writing any server code.

---

## Reflection (5 min)

Before the lesson, write down answers to these three questions:

1. What problem does a validation schema (like Yup) solve that manual `if` checks in a form handler do not?
2. Why does Vite require the `VITE_` prefix instead of exposing all environment variables to the browser?
3. What is one thing you are still unclear about after the pre-reading?

Bring question 3 to class.
