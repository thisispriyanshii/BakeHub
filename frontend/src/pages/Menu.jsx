import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import DetailCard from "../components/DetailCard";
import { fetchProducts } from "../api/client";
import "./Menu.css";


const CART_KEY = "bakehub_cart";

function loadStoredCart() {
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
}

function Menu() {
  const location = useLocation();
  const requestedCategory = useMemo(
    () => new URLSearchParams(location.search).get("category")?.trim() || "",
    [location.search]
  );
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState(() => loadStoredCart());

  useEffect(() => {
    let mounted = true;

    fetchProducts()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setProducts(
            data
              .map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description || "",
                price: p.price,
                calories: Number(p.calories) || null,
                imageUrl: p.imageUrl || p.image || "",
                category: p.category || (p.categoryName ? { name: p.categoryName } : null),
              }))
              .filter((product) => {
                const categoryName = (product.category?.name || "").toLowerCase();
                const productName = (product.name || "").toLowerCase();
                return !categoryName.includes("custom cake") && !productName.includes("custom cake");
              })
          );
        }
      })
      .catch(() => {
        // leave products empty on failure
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const desiredOrder = ["cookies", "brownies", "cupcakes", "dessert boxes", "hampers"];
    const list = [];

    products.forEach((p) => {
      const name = p?.category?.name || p?.categoryName || "Uncategorized";
      if (!name) return;
      if (name.toLowerCase().includes("custom cake")) return;
      if (!list.includes(name)) list.push(name);
    });

    return list.sort((a, b) => {
      const lowerA = a.toLowerCase();
      const lowerB = b.toLowerCase();
      const indexA = desiredOrder.indexOf(lowerA);
      const indexB = desiredOrder.indexOf(lowerB);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return lowerA.localeCompare(lowerB);
    });
  }, [products]);

  const resolvedCategory = useMemo(() => {
    if (!categories.length) return activeCategory;

    const normalizedRequested = requestedCategory.toLowerCase();
    const requestedMatch = categories.find(
      (category) => category.toLowerCase() === normalizedRequested
    );
    if (requestedCategory && requestedMatch) return requestedMatch;

    if (activeCategory === "All") return "All";

    const normalizedActive = activeCategory.toLowerCase();
    const matchingCategory = categories.find(
      (category) => category.toLowerCase() === normalizedActive
    );

    return matchingCategory || categories[0];
  }, [categories, activeCategory, requestedCategory]);

  const saveCartToStorage = (updatedCart) => {
    const existingItems = (() => {
      try {
        const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(raw) ? raw : [];
      } catch {
        return [];
      }
    })();
    // preserve any custom items (those not present in products)
    const preservedCustomItems = existingItems.filter(
      (item) => !products.some((product) => String(product.id) === String(item.id))
    );

    // Build menu-derived items only for product ids that exist in products
    const menuItems = Object.entries(updatedCart)
      .map(([id, quantityRaw]) => {
        const quantity = Math.max(1, Math.min(1000, Number(quantityRaw) || 1));
        return [id, quantity];
      })
      .filter(([, quantity]) => quantity > 0)
      .filter(([id]) => products.some((p) => String(p.id) === String(id)))
      .map(([id, quantity]) => {
        const product = products.find((item) => String(item.id) === String(id));
        return {
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl,
          estimatedPrice: (product.price || 0) * quantity,
          type: "menu",
        };
      });

    // Merge preserved custom items with the reconstructed menu items
    localStorage.setItem(CART_KEY, JSON.stringify([...preservedCustomItems, ...menuItems]));
  };

  useEffect(() => {
    saveCartToStorage(cart);
    window.dispatchEvent(new Event("cart-updated"));
  }, [cart, products]);

  const updateCart = (nextCart) => {
    setCart((prevCart) => {
      const next = typeof nextCart === "function" ? nextCart(prevCart) : nextCart;
      return next;
    });
  };

  const productsByCategory = useMemo(() => {
    return categories.reduce((map, category) => {
      map[category] = products.filter(
        (product) => (product.category?.name || product.categoryName || "Uncategorized") === category
      );
      return map;
    }, {});
  }, [products, categories]);

  const handleNavClick = (category) => {
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
        <button
          key="all"
          className={`category-pill ${resolvedCategory === "All" ? "active" : ""}`}
          type="button"
          onClick={() => handleNavClick("All")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`category-pill ${category === resolvedCategory ? "active" : ""}`}
            type="button"
            onClick={() => handleNavClick(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <div className="menu-content">
        {loading ? (
          <div className="menu-loading">
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <p className="empty-state">No products available.</p>
        ) : (
          <section className="all-products">
            <div className="category-grid">
              {(resolvedCategory === "All" ? products : productsByCategory[resolvedCategory] || []).map((product, index) => (
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
        )}
      </div>
    </div>
  );
}

export default Menu;