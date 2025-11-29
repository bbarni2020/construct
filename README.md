# Construct

A [Hack Club](https://hackclub.com) YSWS event

Built with SvelteKit, deployed with Docker (auto-builds container image and publishes to GitHub packages!)

Stack:

- SvelteKit
- Drizzle ORM
- PostgreSQL
- Cloudflare R2

## Developing

The recommended and easiest way to develop is to use a devcontainer to automatically set up a dev environment.

Copy `.env.example` to `.env` and update the stuff inside, then run this to initialise the database:

```sh
npm run db:migrate
```

Start a development server:

```sh
npm run dev
```

You can also run this to get a GUI for the database:

```sh
npm run db:studio
```

## Deploying

Create a `.env` file containing all the required credentials, look at `.env.example` for an example.

Use the `docker-compose.yaml` file to deploy it.

Use the `staging` image tag instead of `production` for the staging environment.
