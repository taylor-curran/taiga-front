import { Outlet } from "react-router-dom";
import NavigationBar from "./NavigationBar";

export default function AppLayout() {
  return (
    <>
      <NavigationBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
