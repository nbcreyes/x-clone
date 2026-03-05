import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CreatePost from "@/components/shared/CreatePost";
import useSocket from "@/hooks/useSocket";

const MainLayout = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Mount the socket listener at the layout level so it is
  // active for all authenticated pages
  useSocket();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - fixed width */}
        <div className="w-[72px] xl:w-[280px] shrink-0 sticky top-0 h-screen">
          <Sidebar onCreatePost={() => setIsCreatePostOpen(true)} />
        </div>

        {/* Main content area */}
        <main className="flex-1 min-h-screen border-x border-border max-w-[600px]">
          <Outlet />
        </main>

        {/* Right Panel - hidden on smaller screens */}
        <div className="hidden lg:block w-[350px] shrink-0">
          <div className="sticky top-0">
            <RightPanel />
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <div className="p-4">
            <h2 className="font-bold text-lg mb-4">Create Post</h2>
            <CreatePost onSuccess={() => setIsCreatePostOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainLayout;