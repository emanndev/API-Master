# Angular API Master App

A simple Angular application for managing posts using the JSONPlaceholder API. Features include user authentication, post creation, editing, and listing, deployed on Netlify.

## Features

User login/logout with token-based authentication
Fetch, create, edit, and delete posts via JSONPlaceholder API
Responsive UI with SCSS styling
Client-side routing for single-page application
Deployed on Netlify with HTTPS

## Project Structure

├── src/
│ ├── app/
│ │ ├── components/
│ │ │ ├── create-post/
│ │ │ ├── pagination/
│ │ │ ├── edit-post/
│ │ │ ├── login/
│ │ │ ├── post-detail/
│ │ │ ├── posts-list/
│ │ ├── services/
│ │ │ ├── api.service.ts
│ │ │ ├── auth.service.ts
│ │ ├── auth.interceptor.ts
│ │ ├── app.component.
│ │ ├── app.config.ts
│ │ ├── app.routes.ts
│ ├── environments/
│ ├── styles/
│ │ ├── \_mixins.scss
│ ├── index.html
│ ├── main.ts
├── angular.json
├── package.json
├── tsconfig.json

## Getting Started

Prerequisites

Node.js (v18.x recommended)
Angular CLI (npm install -g @angular/cli)

Installation

Clone the repository:git clone <your-repo-url>
cd angular-api-master-app

Install dependencies:npm install

Running Locally

Start the development server:ng serve --ssl

Open https://localhost:4200 in your browser.

Building for Production

Build the app:ng build --configuration production

Output is in dist/angular-api-master-app/browser.

Deployment
Deployed on Netlify at https://angular-api-master-app.netlify.app/.

Push changes to your Git repository.
In Netlify:
Build command: ng build --configuration production
Publish directory: dist/angular-api-master-app/browser
Environment variable: API_URL=https://jsonplaceholder.typicode.com

Login Password
username: testuser
password: password123

Testing
Run unit tests with:
ng test

## Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/new-feature).
Commit changes (git commit -m "Add new feature").
Push to the branch (git push origin feature/new-feature).
Open a pull request.

## License

MIT License
