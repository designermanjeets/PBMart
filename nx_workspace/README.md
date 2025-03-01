# B2B E-commerce Frontend

This is the frontend monorepo for the B2B E-commerce platform, built with Next.js and Nx.

## Structure

- **apps/**
  - **portal-buyer/** - The buyer-facing application
  - **portal-seller/** - The seller-facing application
- **libs-ui/** - UI component libraries
- **libs-next/** - Next.js specific libraries

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   # For buyer portal
   npm run start:buyer
   
   # For seller portal
   npm run start:seller
   ```

3. Build for production:
   ```bash
   # Build all applications
   npm run build:all
   
   # Build specific application
   npm run build:buyer
   npm run build:seller
   ```

## Libraries

- **@b2b/nxt-core** - Core utilities for Next.js applications
- **@b2b/api** - API integration services
- **@b2b/auth** - Authentication components and utilities
- **@b2b/layouts** - Layout components
- **@b2b/store** - State management
- **@b2b/query** - React Query integration
- **@b2b/ui-components** - Shared UI components

## Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Query
- Zustand
- Formik & Yup
- Nx Monorepo

# NxWorkspace

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Run tasks

To run the dev server for your app, use:

```sh
npx nx dev portal-buyer
```

To create a production bundle:

```sh
npx nx build portal-buyer
```

To see all available targets to run for a project, run:

```sh
npx nx show project portal-buyer
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/next:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/react:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/next?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)


How to add new service to the workspace library:

1. Add the service to the `libs-next` folder.
2. Add the service to the `libs-ui` folder.
3. Add the service to the `libs-api` folder.
4. Add the service to the `libs-auth` folder.
5. Add the service to the `libs-layouts` folder.

below command will generate the service in the `libs-next` folder and export it.

```bash
npx nx generate @nx/react:component libs-next/nxt-api/src/lib/_services/products/ProductService --project=nxt-api --export
```

```bash
npx nx generate @nx/react:component libs-next/nxt-auth/src/lib/login/LoginForm --project=nxt-auth --export 
```
How to create new libraries:
```bash
npx nx generate @nx/next:library store --directory=libs-next/nxt-store --importPath=@b2b/store
```

```bash
npx nx generate @nx/next:library layouts --directory=libs-next/nxt-layouts --importPath=@b2b/layouts
```

```bash
npx nx generate @nx/next:library auth --directory=libs-next/nxt-auth --importPath=@b2b/auth
```








