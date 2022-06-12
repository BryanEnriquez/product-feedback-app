# Product Feedback App

## Description

This is my solution to one of the challenges on [frontendmentor.io](https://www.frontendmentor.io/challenges/product-feedback-app-wbvUYqjR6). The starter resources included some demo data (found in `dev-data/data.json`), site text for each page, and image assets (favicon, user avatars, background images, svgs). Additionally, the design to replicate was provided in a figma file. The only requirement was to implement the feature list described in the next section. Otherwise, the tech stack, architecture, front-end only vs full-stack app came down to personal preference. The [live site can be viewed by following this link](https://www.product-feedback-app.com).

## Feature list

Below are the project requirements (paraphrased) given by frontendmentor.io:

- The site should be responsive.
- Interactive elements should have hover states.
- A user should be able to create, read, update, and delete feedback requests.
- Forms for creating/updating feedback requests should validate the user's input.
- A user should be able to upvote feedback requests.
- Suggestions (feedback requests with a status of `suggestion`) should be sortable based on most/least upvotes or most/least comments.
- Suggestions can filtered by category (ui, ux, etc).
- The suggestions page (homepage) should **only** show feedback requests with a status of `suggestion`.
- Feedback requests with a status of `planned`, `in-progress`, or `live` should be shown at the roadmap page.
- Newly created feedback should start with a status of `suggestion`.
- Updating the status of a particular feedback request should move it to the appropriate page.
  - Ex: A feedback request with a status of `suggestion` is updated to `live`. This should result in the request no longer showing up at the suggestions page, but now at the roadmap page.
- Users should be able to comment on feedback requests as well as reply to other user comments.
  - Each comment/reply should be limited to 250 characters.

## Extra features

Here are the features I added to make the project a bit more interesting:

- A backend server (Node.js + Express.js) with a database (PostgreSQL + Sequelize.js) for persisting user data.
- A user login system using JSON Web Tokens.
  - This includes a signup system with email verification for new users.
- An image upload feature for setting a profile picture. Implemented using amazon s3.
- A CDN for optimizing delivery of static assets using the heroku edge addon.
