import { Outlet } from "react-router-dom";

export default function Navigation({children}) {
  return (
    <>
    <p>Navigation</p>
    <Outlet />
    </>
  );
}
