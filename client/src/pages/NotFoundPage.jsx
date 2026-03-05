import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <span className="text-6xl font-black mb-4">X</span>
      <h1 className="text-4xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button
        className="rounded-full font-bold"
        onClick={() => navigate("/")}
      >
        Go home
      </Button>
    </div>
  );
};

export default NotFoundPage;