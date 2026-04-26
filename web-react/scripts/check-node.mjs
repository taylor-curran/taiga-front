const major = Number.parseInt(process.version.slice(1).split('.')[0], 10);
if (Number.isNaN(major) || major < 22) {
  console.error(
    `[web-react] Node.js 22 or newer is required (Vite 5 needs a working Web Crypto API in Node).\n` +
      `  Current: ${process.version}\n` +
      `  Example: source ~/.nvm/nvm.sh && nvm use 22 && npm run build`,
  );
  process.exit(1);
}
