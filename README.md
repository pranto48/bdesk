# BDrive - Cloud Storage Access Platform

A modern web-based file manager that provides unified access to OneDrive and Google Drive storage services.

This is a [Lovable](https://lovable.dev) project.

## Project info

**URL**: https://lovable.dev/projects/cbb62686-23e8-46c6-91e4-4f8da0d11c15

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cbb62686-23e8-46c6-91e4-4f8da0d11c15) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Docker

### Using Pre-built Image

The easiest way to run BDrive is using the pre-built Docker image:

```bash
# Pull and run the latest image
docker run -p 2266:80 arifmahmudpranto/bdrive:latest

# Access the app at http://localhost:2266
```

### Building Locally

```bash
# Build the image
docker build -t bdrive .

# Run the container
docker run -p 2266:80 bdrive

# Tag for Docker Hub (optional)
docker tag bdrive arifmahmudpranto/bdrive
docker push arifmahmudpranto/bdrive
```

### Using Docker Compose

```bash
# Run with docker-compose (for development)
docker-compose up -d

# Run with production image
docker-compose -f docker-compose.prod.yml up -d

# Access at http://localhost:2266 (prod) or http://localhost:3000 (dev)
```

### OAuth Configuration

When running in Docker, configure your OAuth redirect URIs:

**OneDrive/Azure AD:**
- Add `http://localhost:2266` to Redirect URIs in Azure App Registration

**Google Drive:**
- Add `http://localhost:2266` to Authorized JavaScript origins in Google Cloud Console

For production deployments, replace `localhost:2266` with your actual domain.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Docker & Nginx

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cbb62686-23e8-46c6-91e4-4f8da0d11c15) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
