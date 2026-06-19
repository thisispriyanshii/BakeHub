import { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import DetailCard from "../components/DetailCard";
import { fetchProducts } from "../api/client";
import "./Menu.css";

const CATEGORIES = [
  "Brownies",
  "Cupcakes",
  "Cookies",
  "Dessert Boxes",
  "Hampers",
];

const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "Chocolate Fudge Brownie",
    description: "Rich, gooey brownies baked with dark chocolate chunks and a crackly top.",
    price: 4.5,
    imageUrl: "/images/brownie-1.jpg",
    category: { name: "Brownies" },
  },
  {
    id: 2,
    name: "Salted Caramel Brownie",
    description: "Decadent brownie topped with salted caramel and sea salt crystals.",
    price: 5.0,
    imageUrl: "/images/brownie-2.jpg",
    category: { name: "Brownies" },
  },
  {
    id: 3,
    name: "Vanilla Dream Cupcake",
    description: "Light vanilla sponge with silky buttercream and a gold sugar finish.",
    price: 3.75,
    imageUrl: "/images/cupcake-1.jpg",
    category: { name: "Cupcakes" },
  },
  {
    id: 4,
    name: "Red Velvet Cupcake",
    description: "Velvety red cake crowned with cream cheese frosting and berry glaze.",
    price: 4.0,
    imageUrl: "/images/cupcake-2.jpg",
    category: { name: "Cupcakes" },
  },
  {
    id: 5,
    name: "Oatmeal Raisin Cookie",
    description: "Warm, chewy cookies loaded with oats, raisins, and cinnamon.",
    price: 2.25,
    imageUrl: "/images/cookie-1.jpg",
    category: { name: "Cookies" },
  },
  {
    id: 6,
    name: "Chocolate Chip Cookie",
    description: "Classic cookie packed with melty chocolate chips and a golden edge.",
    price: 2.5,
    imageUrl: "/images/cookie-2.jpg",
    category: { name: "Cookies" },
  },
  {
    id: 7,
    name: "Seasonal Dessert Box",
    description: "A curated selection of mini tarts, mousse bites, and fruit sweets.",
    price: 18.0,
    imageUrl: "/images/dessert-box-1.jpg",
    category: { name: "Dessert Boxes" },
  },
  {
    id: 8,
    name: "Chocolate Indulgence Box",
    description: "An elegant assortment of dark chocolate squares and mousse cups.",
    price: 21.0,
    imageUrl: "/images/dessert-box-2.jpg",
    category: { name: "Dessert Boxes" },
  },
  {
    id: 9,
    name: "Fruit & Nut Hamper",
    description: "A gift hamper filled with jam jars, biscotti, and gourmet dried fruit.",
    price: 32.0,
    imageUrl: "/images/hamper-1.jpg",
    category: { name: "Hampers" },
  },
  {
    id: 10,
    name: "Sweet Celebration Hamper",
    description: "Includes cookies, truffles, and a scented candle for a thoughtful gift.",
    price: 35.0,
    imageUrl: "/images/hamper-2.jpg",
    category: { name: "Hampers" },
  },
];

const CART_KEY = "bakehub_cart";

function Menu() {
  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setProducts(
            data.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description || "",
              price: p.price,
              imageUrl: p.imageUrl || p.image || "",
              category: p.category || (p.categoryName ? { name: p.categoryName } : null),
            }))
          );
        }
      })
      .catch(() => {
        // keep dummy products on failure
      });
    return () => {
      mounted = false;
    };
  }, []);

  const loadStoredCart = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(raw)) return {};

      return raw.reduce((acc, item) => {
        if (!item?.id) return acc;
        const qty = Number(item.quantity) || 1;
        acc[item.id] = (acc[item.id] || 0) + qty;
        return acc;
      }, {});
    } catch {
      return {};
    }
  };

  const saveCartToStorage = (updatedCart) => {
    const existingItems = (() => {
      try {
        const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(raw) ? raw : [];
      } catch {
        return [];
      }
    })();

    const preservedCustomItems = existingItems.filter(
      (item) => !products.some((product) => product.id === item.id)
    );

    const menuItems = Object.entries(updatedCart)
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const product = products.find((item) => String(item.id) === String(id)) || DUMMY_PRODUCTS.find((item) => String(item.id) === String(id)) || { id, name: "Unknown", price: 0, imageUrl: "", category: null };
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl,
          estimatedPrice: (product.price || 0) * quantity,
          type: "menu",
        };
      });

    localStorage.setItem(CART_KEY, JSON.stringify([...preservedCustomItems, ...menuItems]));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const [cart, setCart] = useState(() => loadStoredCart());

  const updateCart = (nextCart) => {
    setCart((prevCart) => {
      const next = typeof nextCart === "function" ? nextCart(prevCart) : nextCart;
      saveCartToStorage(next);
      return next;
    });
  };

  const productsByCategory = useMemo(() => {
    return CATEGORIES.reduce((map, category) => {
      map[category] = products.filter(
        (product) => product.category?.name === category
      );
      return map;
    }, {});
  }, [products]);

  const handleNavClick = (category) => {
    const target = document.getElementById(category);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveCategory(category);
  };

  const handleIncrement = (productId) => {
    updateCart((prevCart) => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1,
    }));
  };

  const handleDecrement = (productId) => {
    updateCart((prevCart) => {
      const currentQty = prevCart[productId] || 0;
      if (currentQty <= 1) {
        const { [productId]: _, ...nextCart } = prevCart;
        return nextCart;
      }
      return {
        ...prevCart,
        [productId]: currentQty - 1,
      };
    });
  };

  return (
    <div className="menu-page">
      <Navbar />

      <section className="menu-hero">
        <div className="hero-copy">
          <span className="eyebrow">Bakery menu</span>
          <h1>Sweet collections for every celebration.</h1>
          <p>
            Explore our curated categories and discover artisan treats made with premium ingredients,
            luxury textures and thoughtful design.
          </p>
        </div>
      </section>

      <nav className="category-bar">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`category-pill ${category === activeCategory ? "active" : ""}`}
            type="button"
            onClick={() => handleNavClick(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <div className="menu-content">
        {CATEGORIES.map((category) => {
          const items = productsByCategory[category] || [];
          if (!items.length) return null;

          return (
            <section className="category-section" id={category} key={category}>
              <div className="section-head">
                <h2>{category}</h2>
                <p>{`Delicate ${category.toLowerCase()} crafted from scratch for memorable moments.`}</p>
              </div>

              <div className="category-grid">
                {items.map((product, index) => (
                  <DetailCard
                    key={product.id}
                    product={product}
                    reversed={index % 2 === 1}
                    quantity={cart[product.id] || 0}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default Menu;