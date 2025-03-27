"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
// import { useAppDispatch, useAppSelector } from "@/lib/store";
// import { registerUser } from "@/lib/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector,RootState } from "@/lib/store/store";
import { registerUser } from "@/lib/store/feature/auth/auth-slice";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

const RegisterForm = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(registerUser(formData));
      
      if (registerUser.fulfilled.match(result)) {
        // router.push("/dashboard"); // Redirect after successful registration
        console.log("hi")
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <>
      <div className="pt-4 pb-2">
        <h1 className="pb-2 text-lg font-bold">Create an account</h1>
        <h2 className="text-md text-gray-600 pb-6">Join us today</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="your.email@gmail.com"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md pr-10"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full bg-blue-500 text-white p-2 rounded-md ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
          } transition-colors`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </>
  );
};

export default RegisterForm;