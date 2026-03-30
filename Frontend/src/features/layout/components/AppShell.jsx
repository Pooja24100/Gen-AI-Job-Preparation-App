import React, { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import "../style/app-shell.scss";

const SIDEBAR_ITEMS = [
    { to: "/", label: "Dashboard", icon: "grid" },
    { to: "/upload", label: "Upload Section", icon: "upload" },
    { to: "/interviews", label: "Interview List", icon: "table" },
    { to: "/profile", label: "Profile Section", icon: "user" },
];

const ICONS = {
    grid: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
        </svg>
    ),
    upload: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M4 20h16" />
        </svg>
    ),
    table: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 10h18" />
            <path d="M9 4v16" />
            <path d="M15 4v16" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c1.8-3.4 4.5-5 8-5s6.2 1.6 8 5" />
        </svg>
    ),
    logout: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
        </svg>
    ),
    menu: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
        </svg>
    ),
};

const initialsFromName = (name) => {
    if (!name) return "U";

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join("");
};

const AppShell = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, profile, handleLogout } = useAuth();

    const displayName = useMemo(
        () => profile?.name || user?.fullName || user?.username || "User",
        [profile, user]
    );

    const displayEmail = profile?.email || user?.email || "";
    const displayAvatar = profile?.avatar || user?.avatar || "";

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="app-shell">
            <aside className={`app-sidebar ${isSidebarOpen ? "app-sidebar--open" : ""}`}>
                <div className="app-sidebar__brand">
                    <div className="app-sidebar__brand-mark">IQ</div>
                    <div>
                        <p className="app-sidebar__eyebrow">Interview Studio</p>
                        <h1>Talent Dashboard</h1>
                    </div>
                </div>

                <nav className="app-sidebar__nav">
                    {SIDEBAR_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) => `app-sidebar__link ${isActive ? "app-sidebar__link--active" : ""}`}
                            onClick={closeSidebar}
                        >
                            <span className="app-sidebar__icon">{ICONS[item.icon]}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="app-sidebar__profile">
                    <div className="app-sidebar__avatar">
                        {displayAvatar ? <img src={displayAvatar} alt={displayName} /> : initialsFromName(displayName)}
                    </div>
                    <div className="app-sidebar__profile-copy">
                        <strong>{displayName}</strong>
                        <span>{displayEmail}</span>
                    </div>
                    <button type="button" className="app-sidebar__logout" onClick={handleLogout}>
                        {ICONS.logout}
                    </button>
                </div>
            </aside>

            <div className="app-shell__content">
                <header className="app-topbar">
                    <button
                        type="button"
                        className="app-topbar__menu"
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                    >
                        {ICONS.menu}
                    </button>

                    <div className="app-topbar__copy">
                        <p>Candidate workspace</p>
                        <h2>Manage interview readiness in one place</h2>
                    </div>
                </header>

                <main className="app-shell__main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppShell;
