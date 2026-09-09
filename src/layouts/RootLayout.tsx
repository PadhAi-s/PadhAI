import { Link, Outlet } from "react-router-dom";

export function RootLayout() {
  const logoUrl = `${import.meta.env.BASE_URL}favicon.png`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
          <Link
            to="/"
            className="group flex items-center gap-3"
            aria-label="Ranker Bhaiya"
          >
            <img
              src={logoUrl}
              alt="Ranker Bhaiya"
              className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-blue-500/20 transition group-hover:scale-105"
            />

            <div className="text-left">
              <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
                Ranker{" "}
                <span className="text-yellow-500">
                  Bhaiya
                </span>
              </div>

              <div className="text-[10px] font-medium tracking-wide text-slate-400">
                Aapki Mehnat&nbsp; · &nbsp;Hamari Strategy
              </div>
            </div>
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
