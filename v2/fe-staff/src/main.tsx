import ReactDOM from 'react-dom/client';
import './shared/styles/app.css';
import './shared/i18n/i18n';
import { App } from './App';

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <>
      <App />
    </>
  );
}

bootstrap();
