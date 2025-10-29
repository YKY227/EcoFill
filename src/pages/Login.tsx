import { FormEvent, useState } from "react";
import { endpoints } from "@/api/endpoints";
import { useNavigate, Link } from "react-router-dom";
import RefillVisual from "@/components/RefillVisual";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await endpoints.login(email, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      nav("/");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left column */}
      <div className="flex items-center justify-center bg-green-50 dark:bg-green-900 p-6">
        {/* Tweaked defaults align to your screenshot; adjust xPct/yPct/wPct/hPct if needed */}
        <RefillVisual
          xPct={64.5}
          yPct={57.5}
          wPct={10.5}
          hPct={20.5}
          //debug // uncomment to see a dashed outline for calibration
        />
      </div>

      {/* Right column with login form */}
<div className="flex items-center justify-center p-8">
  <div className="w-full max-w-md card">

    {/* Slogan: three rows, key verbs bold & green, sequential reveal + subtle loop */}
    <div className="text-center text-xl font-semibold mb-6 space-y-1">
      <p
        className="eco-slogan-line"
        style={{ animationDelay: "0ms, 0ms" }}  // fade in immediately, breathe immediately
      >
        <span className="font-extrabold text-green-600">DIGITALIZE</span> Refills.
      </p>
      <p
        className="eco-slogan-line"
        style={{ animationDelay: "300ms, 300ms" }}  // reveal second
      >
        <span className="font-extrabold text-green-600">AUTOMATE</span> Impacts.
      </p>
      <p
        className="eco-slogan-line"
        style={{ animationDelay: "600ms, 600ms" }}  // reveal third
      >
        <span className="font-extrabold text-green-600">SUSTAIN</span> Our Future.
      </p>
    </div>

    <h1 className="text-2xl font-semibold mb-4">Login</h1>
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <div className="text-red-600">{error}</div>}
      <button className="btn w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
    <p className="mt-4 text-sm text-center">
      No account? <Link to="/signup" className="link">Sign up</Link>
    </p>
  </div>
</div>

    </div>
  );
}
