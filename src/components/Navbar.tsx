import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img src="/logo.png" alt="CleanExpress Logo" className="h-10 w-auto" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;