import React, { useEffect } from "react";
import "../styles/LayoutStyles.css";
import { adminMenu, userMenu } from "./../Data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Badge, Avatar, message, Switch } from "antd";
import { toggleTheme } from "../redux/features/themeSlice";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const { isDarkMode } = useSelector((state) => state.theme);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleThemeChange = () => {
    dispatch(toggleTheme());
  };

  // logout funtion
  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout Successfully");
    navigate("/login");
  };

  // =========== doctor menu ===============
  const doctorMenu = [
    {
      name: "Home",
      path: "/",
      icon: "fa-solid fa-house",
    },
    {
      name: "Appointments",
      path: "/doctor-appointments",
      icon: "fa-solid fa-list",
    },
    {
      name: "Apply As a Doctor",
      path: `/doctor/profile/${user?._id}`,
      icon: "fa-solid fa-user",
    },
  ];

  // redering menu list
  const SidebarMenu = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;

  return (
    <>
      <div className="main">
        <div className="layout">
          <div className="sidebar">
            <div className="logo">
              <h6 className="text-light">DOC APP</h6>
              <hr />
            </div>
            <div className="menu">
              {SidebarMenu.map((menu) => {
                const isActive = location.pathname === menu.path;
                return (
                  <div key={menu.name} className={`menu-item ${isActive && "active"}`}>
                    <i className={menu.icon}></i>
                    <Link to={menu.path}>{menu.name}</Link>
                  </div>
                );
              })}
              <div className={`menu-item`} onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i>
                <Link to="/login">Logout</Link>
              </div>
            </div>
          </div>
          <div className="content">
            <div className="header">
              <div className="header-content">
                <Switch
                  checked={isDarkMode}
                  onChange={handleThemeChange}
                  checkedChildren={<i className="fas fa-moon" />}
                  unCheckedChildren={<i className="fas fa-sun" />}
                  className="theme-switch"
                />
                <Badge
                  count={user?.notifcation?.length || 0}
                  onClick={() => {
                    navigate("/notification");
                  }}
                >
                  <i className="fa-solid fa-bell"></i>
                </Badge>
                <Link to="/profile" className="profile-link">
                  <Avatar 
                    src={user?.profilePicture} 
                    size="large"
                    style={{ marginRight: '10px' }}
                  />
                  <span>{user?.name}</span>
                </Link>
              </div>
            </div>
            <div className="body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
