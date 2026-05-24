# 2.11 Form Handling, Validation, and Deployment

## Lesson Overview

This lesson completes the CRM project and ships it to the web. Learners replace the local json-server with MockAPI.io so the app works at a public URL, then build a form for logging customer interactions. The form is validated in two stages: first with manual `if` checks to illustrate the maintenance problem, then with a Yup schema that centralises all rules. The lesson closes by introducing Vite environment variables and walking through a full Netlify deployment with continuous deployment from GitHub.

## Dependencies

- [Self Studies](./studies.md)
- [Lesson](./lesson.md)
- [Assignment](./assignment.md)

## Lesson Objectives

- Build a controlled form in React and handle submission with client-side validation
- Apply a Yup schema to validate form input and display field-level error messages
- Deploy a React application to Netlify using environment variables for configuration

## Lesson Plan

| Duration  | What                                          | How or Why                                                                                                                                          |
| --------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10 min    | Warm up and recap                             | Recap Lesson 2.8: routes, pages, protected routes; surface the deployment problem — json-server only works locally                                  |
| 15 min    | The deployment problem and MockAPI.io         | Slides: why localhost cannot deploy; MockAPI.io as a hosted REST API; the base URL swap                                                             |
| 15 min    | Forms and validation concepts                 | Slides: controlled inputs, manual validation, the duplication problem; Yup schema as the solution; environment variables and the VITE_ prefix       |
| 5 min     | Break                                         |                                                                                                                                                     |
| 20 min    | Code-along: MockAPI.io setup                  | Create project and resources on MockAPI.io; seed data; update API_BASE in CustomerContext and CustomerDetail; verify in browser                     |
| 30 min    | Code-along: Add Interaction form              | Build AddInteractionForm component; POST to interactions endpoint; add manual validation in handleSubmit and onBlur; show the duplication problem   |
| 10 min    | Activity: minimum length rule                 | Learners add a 10-character minimum rule using the manual approach; debrief highlights why the duplication is a problem                             |
| 5 min     | Break                                         |                                                                                                                                                     |
| 25 min    | Code-along: Yup validation                    | Install Yup; define interactionSchema; replace handleSubmit checks with validate(); replace handleBlur with validateAt(); verify error behaviour    |
| 10 min    | Code-along: environment variables             | Create .env.development and .env.production; replace hardcoded URLs with import.meta.env.VITE_API_BASE_URL; add files to .gitignore                |
| 25 min    | Code-along: Netlify deployment                | Push to GitHub; create Netlify site; set VITE_API_BASE_URL in dashboard; deploy; verify live URL; demo continuous deployment with a small change    |
| 10 min    | Optional: Formik                              | Live demo showing how useFormik + getFieldProps removes useState/handleChange/handleBlur boilerplate while reusing the same Yup schema              |
| 15 min    | Wrap up and Q&A                               | Summary table; common pitfalls (missing VITE_ prefix, env var set after build); preview Lesson 2.12 — Next.js                                      |
| **Total** |                                               | **185 min — core lesson is ~165 min; Formik extension fills remaining time if pacing allows**                                                       |
