import { build } from 'vite';

async function runBuild() {
  try {
    await build({
      root: 'c:/Users/HP/AdminDashAnti-main/uniFleet/client',
      logLevel: 'info',
    });
    console.log('Build successful');
  } catch (err) {
    console.error('Build failed', err);
  }
}
runBuild();
