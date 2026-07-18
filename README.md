# 2.11 Form Handling, Validation, and Deployment

## Lesson Overview

This lesson completes the CRM project and ships it to the web. Learners build a form for logging customer interactions, validated in two stages: first with manual `if` checks to illustrate the maintenance problem, then with a Yup schema that centralises all rules. The lesson then confronts the deployment problem: json-server cannot be deployed, so learners move the app to MockAPI.io, introduce Vite environment variables, and walk through a full Netlify deployment with continuous deployment from GitHub.

## Dependencies

- [Self Studies](./studies.md)
- [Lesson](./lesson.md)
- [Assignment](./assignment.md)

## Lesson Objectives

- Build a controlled form in React and handle submission with client-side validation
- Apply a Yup schema to validate form input and display field-level error messages
- Deploy a React application to Netlify using environment variables for configuration

## Lesson Plan

| Duration  | What                                             | How or Why                                                                                                                                       |
| --------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10 min    | Warm up and recap                                | Recap Lesson 2.8: routes, pages, protected routes; preview today's feature, logging customer interactions                                          |
| 15 min    | Forms and validation concepts                    | Slides: controlled inputs, manual validation, the duplication problem; Yup schema as the solution                                                  |
| 30 min    | Code-along: Build the Add Interaction form        | Add an interactions resource to db.json; build AddInteractionForm and the interaction list; add manual validation in handleSubmit and onBlur       |
| 5 min     | Break                                             |                                                                                                                                                       |
| 10 min    | Activity: minimum length rule                     | Learners add a 10-character minimum rule using the manual approach; debrief highlights why the duplication is a problem                             |
| 25 min    | Code-along: Replace manual validation with Yup     | Install Yup; define interactionSchema; replace handleSubmit checks with validate(); replace handleBlur with validateAt(); verify error behaviour    |
| 15 min    | Activity: Validate the new customer form with Yup  | Learners apply the same Yup pattern to the existing NewCustomerPage form                                                                            |
| 5 min     | Break                                              |                                                                                                                                                       |
| 20 min    | Code-along: Replace json-server with MockAPI.io    | Explain why json-server cannot deploy; create a MockAPI.io project and resources; connect the CRM; fix updateCustomer and fetchInteractions         |
| 10 min    | Code-along: environment variables                 | Create .env.development and .env.production; replace hardcoded URLs with import.meta.env.VITE_API_BASE_URL; add files to .gitignore                |
| 25 min    | Code-along: Deploy to Netlify                      | Push to GitHub; create Netlify site; set VITE_API_BASE_URL in dashboard; fix the SPA redirect; verify live URL; demo continuous deployment           |
| 10 min    | Wrap up and Q&A                                    | Summary table; bonus challenges for fast finishers; Formik as a self-study extension                                                                |
| **Total** |                                                    | **180 min (3 hours)**                                                                                                                                |
