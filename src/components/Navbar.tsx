import { Link, useLocation, useParams } from "react-router-dom";
import { Menu, Package2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCompanyTheme } from "@/hooks/useCompanyTheme";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";

const Navbar = () => {
    const { brandName } = useParams<{ brandName?: string }>();
    const location = useLocation();
    const { company, theme } = useCompanyTheme();
    const { theme: appTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const getDisplayName = () => {
        if (location.pathname === "/") {
            return "CleanExpress & Lumina";
        }
        if (brandName) {
            return brandName
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        }
        return "Catalogue";
    };

    const displayName = getDisplayName();

    const NavLinks = ({ mobile = false, onClick = () => { } }: { mobile?: boolean; onClick?: () => void }) => (
        <>
            <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                    } ${mobile ? "block py-2" : ""}`}
                onClick={onClick}
            >
                Accueil
            </Link>
            {brandName && (
                <Link
                    to={`/catalogue/${brandName}`}
                    className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname.includes("/catalogue")
                        ? "text-primary"
                        : "text-muted-foreground"
                        } ${mobile ? "block py-2" : ""}`}
                    onClick={onClick}
                >
                    Catalogue
                </Link>
            )}
            <Link
                to="/contact"
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === "/contact"
                    ? "text-primary"
                    : "text-muted-foreground"
                    } ${mobile ? "block py-2" : ""}`}
                onClick={onClick}
            >
                Contact
            </Link>
            <Link
                to="/favorites"
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === "/favorites"
                    ? "text-primary"
                    : "text-muted-foreground"
                    } ${mobile ? "block py-2" : ""}`}
                onClick={onClick}
            >
                Favoris
            </Link>
        </>
    );

    // Determine which logo to use based on theme
    const logoSrc = company && theme?.logo
        ? (appTheme === "dark" && theme.logoDark ? theme.logoDark : theme.logo)
        : null;

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            style={
                company
                    ? {
                        borderColor: `var(--company-border)`,
                    }
                    : {}
            }
        >
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link to="/" className="mr-6 flex items-center space-x-2">
                        {logoSrc ? (
                            <img
                                src={logoSrc}
                                alt={`${displayName} logo`}
                                className="h-8 w-auto object-contain"
                            />
                        ) : (
                            <Package2 className="h-6 w-6" />
                        )}
                        <span className="hidden font-bold sm:inline-block">
                            {displayName}
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <NavLinks />
                    </nav>
                </div>

                {/* Mobile Menu */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0">
                        <Link
                            to="/"
                            className="flex items-center gap-2 font-bold"
                            onClick={() => setIsOpen(false)}
                        >
                            {logoSrc ? (
                                <img
                                    src={logoSrc}
                                    alt={`${displayName} logo`}
                                    className="h-6 w-auto object-contain"
                                />
                            ) : (
                                <Package2 className="h-6 w-6" />
                            )}
                            <span>{displayName}</span>
                        </Link>
                        <div className="my-4 flex flex-col space-y-3 pb-10 pl-6">
                            <NavLinks mobile onClick={() => setIsOpen(false)} />
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search could go here */}
                    </div>
                    <nav className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link to="/login">
                            <Button variant="ghost" size="icon">
                                <User className="h-5 w-5" />
                                <span className="sr-only">Compte</span>
                            </Button>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
