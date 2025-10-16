import { Link } from "react-router-dom";
import { CartSheet } from "./CartSheet";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">CleanExpress</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <CartSheet />
        </div>
      </div>
    </header>
  );
};

export default Navbar;