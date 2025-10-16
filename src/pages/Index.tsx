import ProductList from "@/components/ProductList";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Catalogue CleanExpress
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Découvrez notre gamme de produits détergents professionnels.
        </p>
      </header>
      <main>
        <ProductList />
      </main>
      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;