import { FormEvent, useState } from "react";
import { endpoints } from "@/api/endpoints";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await endpoints.signup(name, email, password);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      nav("/");
    } catch (e:any) {
      setError(e?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto card">
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div className="text-red-600">{error}</div>}
          <button className="btn w-full" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
        </form>
        <p className="mt-4 text-sm">Have an account? <Link to="/login" className="link">Login</Link></p>
      </div>
    </div>
  );
}
