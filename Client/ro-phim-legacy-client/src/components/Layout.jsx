import { Outlet } from "react-router-dom";
import Header from "./header/Header";

const Layout = ({ handleLogout }) => {
    return (
        <main className="App">

            <Header handleLogout={handleLogout} />


            <Outlet />
        </main>
    );
};

export default Layout;