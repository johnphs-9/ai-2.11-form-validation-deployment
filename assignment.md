# Optional Assignment: Event RSVP Form

## Overview

- **Lesson:** Form Handling, Validation, and Deployment / 2.11
- **Type:** Optional Take-Home Assignment
- **Estimated Time:** 2 to 3 hours
- **Submission:** GitHub repository link (or ZIP file) plus a live Netlify URL

## Learning Objectives Covered

This assignment reinforces:

- Building a controlled form and handling submission in React
- Defining a Yup schema and validating on both submit and blur
- Reading configuration from Vite environment variables with the `VITE_` prefix
- Deploying a React application to Netlify, including the SPA redirect and continuous deployment

## Assignment Description

Build an **Event RSVP Form**: a small single-page app where a visitor can view an event's details and submit an RSVP with their name, email, number of guests, and dietary preferences. Submitted RSVPs are posted to a hosted mock API and displayed in a running list on the same page.

This project is intentionally separate from the CRM so you can apply the form and validation pattern to a different domain without copying the lab code directly.

### What You Will Build

A single-page React application that:

- Shows an event's name, date, and location at the top of the page
- Renders an RSVP form with name, email, number of guests, and dietary preference fields
- Validates every field with a Yup schema, on blur and on submit
- Posts a valid submission to a MockAPI.io resource
- Displays the list of RSVPs already submitted, refetched from the API after each new submission
- Reads its API base URL from a Vite environment variable, not a hardcoded string
- Is deployed to Netlify with working client-side routing and continuous deployment from GitHub

## Requirements

### Core Requirements

#### 1. Project Setup

- [ ] Create a new React app using Vite: `npm create vite@latest event-rsvp -- --template react`
- [ ] Install Yup: `npm install yup`
- [ ] No other form or validation libraries; use plain controlled inputs and Yup, the same as `AddInteractionForm` in the lesson

#### 2. Event Details

Hardcode a single event's details as a constant; no form is needed to create the event itself:

```js
const EVENT = {
  name: "Annual Tech Meetup",
  date: "2026-09-12",
  location: "Suntec Convention Centre, Hall 3",
};
```

Display `EVENT.name`, `EVENT.date`, and `EVENT.location` above the RSVP form.

#### 3. MockAPI.io Setup

1. Create a free account at [https://mockapi.io](https://mockapi.io) and a new project.
2. Add one resource named `rsvps` with the following fields:

   | Field name | Type |
   |------------|------|
   | `name` | String |
   | `email` | String |
   | `guests` | Number |
   | `dietary` | String |

3. Do not use the Generate button; you will create real records through the app's own form, the same as the lesson's `customers` resource.
4. Copy the project's base URL for use in the next step.

#### 4. Environment Variables

- [ ] Create `.env.development` and `.env.production` in the project root, each defining `VITE_API_BASE_URL`
- [ ] Both files can point at the same MockAPI.io URL, since this project has no local server to fall back to
- [ ] Read the value in your code with `import.meta.env.VITE_API_BASE_URL`, never a hardcoded string
- [ ] Add `.env*` and `!.env.example` to `.gitignore`, and commit an `.env.example` with the variable name and no value

#### 5. The RSVP Form

Build a controlled form component, `RsvpForm`, with these fields:

| Field | Input type | Rule |
|-------|-----------|------|
| `name` | text | required |
| `email` | email | required, must be a valid email address |
| `guests` | number | required, whole number, minimum 1, maximum 10 |
| `dietary` | select (`none`, `vegetarian`, `vegan`, `halal`) | required |

Requirements for the component:

- [ ] `useState` holds `formData`, matching the shape `{ name: '', email: '', guests: 1, dietary: 'none' }`
- [ ] A Yup schema, `rsvpSchema`, defines all four rules in one place
- [ ] `handleSubmit` calls `rsvpSchema.validate(formData, { abortEarly: false })`; on failure, build a `fieldErrors` object from `err.inner` the same way `AddInteractionForm` does, and stop before the network request
- [ ] `handleBlur` calls `rsvpSchema.validateAt(name, formData)` for the field just left, the same pattern as the lesson
- [ ] On a successful submission, `POST` to `${API_BASE}/rsvps`, read the saved record from the response body, reset the form, and add the new RSVP to the displayed list without a second network request, the same pattern `AddInteractionForm`'s `onSuccess` uses
- [ ] Each field shows its own error message below it when invalid

#### 6. The RSVP List

- [ ] On mount, fetch all records from `${API_BASE}/rsvps` and store them in state
- [ ] Render each RSVP's name, number of guests, and dietary preference in a list below the form
- [ ] Show "No RSVPs yet." when the list is empty

#### 7. Deploy to Netlify

- [ ] Push the project to a GitHub repository
- [ ] Create a Netlify site from that repository with build command `npm run build` and publish directory `dist`
- [ ] Set `VITE_API_BASE_URL` in Netlify's environment variables before the first deploy
- [ ] Add `public/_redirects` with `/*  /index.html  200`, even though this project has only one route, so the pattern is in place if routes are added later
- [ ] Confirm the live URL loads the event details, accepts a submission, and shows it in the list
- [ ] Push one additional small change (for example, a heading tweak) and confirm Netlify rebuilds automatically

### Stretch Goals

- [ ] Add a `.max()` rule rejecting more than 10 guests with the message `"Cannot RSVP for more than 10 guests."`, and a corresponding minimum with `"At least 1 guest is required."`
- [ ] Disable the submit button and show `"Submitting..."` while the request is in flight, the same pattern as `AddInteractionForm`'s `submitting` state
- [ ] Add a `DELETE /rsvps/:id` action so an RSVP can be withdrawn from the list
- [ ] Show the running total number of guests across all RSVPs, updated as new ones are added
- [ ] Add a second event, selectable from a dropdown, and store an `eventId` field on each RSVP so the list only shows RSVPs for the selected event

## Deliverables

- GitHub repository link (or ZIP file) submitted to the course platform
- The live Netlify URL
- A `README.md` in the project root explaining how to install and run the project locally (`npm install` and `npm run dev`), and listing the environment variable it expects
- Screenshots or a short screen recording demonstrating:
  - Submitting the form with a field left empty, showing all resulting errors at once
  - Typing an invalid email and seeing the error appear on blur
  - A successful submission appearing in the RSVP list without a page reload
  - The live Netlify URL working end to end

## AI and Tools

If you use an AI coding assistant:

- Document which parts were AI-assisted in your `README.md`
- Review and understand any generated code before submitting; you may be asked to explain your implementation choices
- Validate the application manually against the requirements checklist above

## Collaboration

Discuss ideas and approaches with classmates, but submit your own implementation, and credit any classmates or external sources whose ideas you used.

## References

- [Yup: GitHub](https://github.com/jquense/yup)
- [MockAPI.io](https://mockapi.io)
- [Vite: Environment Variables and Modes](https://vitejs.dev/guide/env-and-mode)
- [Netlify: Getting Started](https://docs.netlify.com/get-started/)
