const Footer = () => {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} CleanExpress. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
            <a href="#" className="hover:text-primary transition-colors">Mentions Légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;