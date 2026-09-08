/**
 * @file ecosystem.config.cjs
 * @description PM2 Process Manager Configuration for GoCoupon VPS Deployment.
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: "gocoupon-web",
      script: "node_modules/.bin/tsx",
      args: "server/server.ts",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "127.0.0.1",
      },
      env_file: ".env",
      exp_backoff_restart_delay: 100,
    },
  ],
};
