import { Outlet } from "react-router-dom";

// Placeholder layout - will be fully built in Step 16
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
};

export default MainLayout;