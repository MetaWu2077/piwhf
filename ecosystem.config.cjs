module.exports = {
  apps: [
    {
      name: "adaiwiz",
      cwd: "/var/www/adaiwiz/current",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      max_memory_restart: "512M",
      time: true,
    },
  ],
};
