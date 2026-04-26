import { RouterProvider } from 'react-router';
import { AppProviders } from './providers/AppProviders';
import { adminRouter } from './routes/adminRouter';

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={adminRouter} />
    </AppProviders>
  );
}
