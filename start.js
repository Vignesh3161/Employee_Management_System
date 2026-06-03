import { execSync } from 'child_process';

if (process.env.RENDER === 'true') {
  console.log('Detected Render environment. Building and running production preview...');
  execSync('npx vite build && npx vite preview', { stdio: 'inherit' });
} else {
  console.log('Detected local environment. Starting Vite dev server...');
  execSync('npx vite', { stdio: 'inherit' });
}
