import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", form);

      alert(res.data.message);

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-[420px] bg-slate-900 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Create Account
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            className="w-full p-3 rounded-lg bg-slate-800 text-white mb-4"
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-slate-800 text-white mb-4"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-slate-800 text-white mb-6"
            onChange={handleChange}
          />

          <button className="w-full bg-green-600 py-3 rounded-lg">
            Register
          </button>
        </form>

        <p className="text-center text-gray-400 mt-5">
          Already have an account?
        </p>

        <Link
          to="/"
          className="text-blue-400 block text-center mt-2"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Signup;