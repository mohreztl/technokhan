module.exports = {
  apps: [
    {
      name: 'autolounge-web',
      cwd: './apps/web',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'autolounge-api',
      cwd: './apps/api',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
