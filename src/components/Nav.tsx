import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useLogout } from "@/hooks/useLogout";


export default function Nav() {
  const logout = useLogout();
  return (
    <header className="border-b border-gray-200/70 dark:border-gray-800">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="font-semibold text-lg">♻️ EcoRewards</Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/" className={({isActive})=> isActive ? 'link font-semibold' : 'link'}>Wallet</NavLink>
          <NavLink to="/scan" className={({isActive})=> isActive ? 'link font-semibold' : 'link'}>Scan</NavLink>
          <NavLink to="/leaderboard" className={({isActive})=> isActive ? 'link font-semibold' : 'link'}>Leaderboard</NavLink>
          <NavLink to="/impact" className={({isActive})=> isActive ? 'link font-semibold' : 'link'}>Impact</NavLink>
          <NavLink to="/redeem" className={({isActive})=> isActive ? 'link font-semibold' : 'link'}>Redeem</NavLink>
          <NavLink to="/admin" className={({isActive})=> isActive ? 'link font-semibold' : 'link'}>Admin</NavLink>

          <button
            onClick={() => logout.mutate()}
            className="btn-secondary ml-auto"
            disabled={logout.isPending}
        >
          {logout.isPending ? "Logging out..." : "Log out"}
        </button>
        <ThemeToggle />
        </nav>

        
      </div>
    </header>
  )
}
