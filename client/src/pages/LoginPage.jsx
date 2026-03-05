import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";

const LoginPage = () => {
  const { login, isLoginLoading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center">
        <span className="text-white text-9xl font-black">X</span>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          <span className="text-4xl font-black block mb-8">X</span>

          <h1 className="text-3xl font-bold mb-8">Sign in to X</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full rounded-full font-bold h-11 text-base mt-2"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Do not have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;