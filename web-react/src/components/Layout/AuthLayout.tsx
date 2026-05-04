import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-taiga-grey-lighter bg-white">
        <div className="max-w-7xl mx-auto h-14 flex items-center px-4">
          <Link to="/" className="text-taiga-green-dark font-extrabold text-xl tracking-tight no-underline hover:no-underline">
            taiga
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="card p-8 w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
