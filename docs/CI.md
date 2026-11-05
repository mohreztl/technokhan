# Continuous integration

The repository ships `.github/workflows/docker-build.yml`, which builds and pushes the
web and API images. The pipeline below adds a type-check and lint job in front of that
build and fixes the image job's name so the two services are distinguishable.

It is kept here rather than committed to `.github/workflows/` because updating workflow
files needs a token with the `workflow` scope, which the session that wrote this change
did not have. Copy it over `.github/workflows/docker-build.yml` when you want it.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    name: Type-check & lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.11.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build shared package
        run: pnpm --filter @technokhan/shared build

      - name: Validate Prisma schema & generate client
        run: |
          pnpm --filter api exec prisma validate
          pnpm --filter api exec prisma generate
        env:
          DATABASE_URL: postgresql://ci:ci@localhost:5432/ci?schema=public

      - name: Type-check
        run: pnpm -r type-check

      - name: Lint web
        run: pnpm --filter web lint

      - name: Unit tests
        run: pnpm test
```

Keep the existing `build-and-push` job from the current workflow after this one, and give
it `needs: test` so images are only published once the checks pass.

## Running the same checks locally

```bash
pnpm install
```

```bash
pnpm type-check
```

```bash
pnpm lint
```

```bash
pnpm test
```

```bash
pnpm build
```

On Windows, `pnpm build` skips the Next.js standalone bundle: tracing it creates symlinks,
which Windows refuses unless Developer Mode is enabled. Docker and CI build on Linux and
always produce it, and `NEXT_STANDALONE=true` forces it anywhere.
