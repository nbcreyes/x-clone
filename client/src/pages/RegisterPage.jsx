import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";

const RegisterPage = () => {
  const { register, isRegisterLoading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    register(form);
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

          <h1 className="text-3xl font-bold mb-8">Create your account</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              name="name"
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
            <Input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
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
              placeholder="Password (min 8 characters)"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              minLength={8}
            />

            <Button
              type="submit"
              className="w-full rounded-full font-bold h-11 text-base mt-2"
              disabled={isRegisterLoading}
            >
              {isRegisterLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;