import { useEffect, useMemo, useState } from "react";
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
  const [products, setProducts] = useState([]);
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

  useEffect(() => {
    if (categories.length && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  const saveCartToStorage = (updatedCart) => {
    const existingItems = (() => {
      try {
        const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(raw) ? raw : [];
      } catch {
        return [];
      }
    })();

    // keep only those existing custom items that don't collide with generated menu items
    const preservedCustomItems = existingItems.filter(
      (item) => !products.some((product) => String(product.id) === String(item.id))
    ).filter(
      (item) => !Object.entries(updatedCart).some(([mappedId]) => String(mappedId) === String(item.id))
    );

    const menuItems = Object.entries(updatedCart)
      .map(([id, quantityRaw]) => {
        const quantity = Math.max(1, Math.min(1000, Number(quantityRaw) || 1));
        return [id, quantity];
      })
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const product = products.find((item) => String(item.id) === String(id)) || { id, name: "Unknown", price: 0, imageUrl: "", category: null };
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
          className={`category-pill ${activeCategory === "All" ? "active" : ""}`}
          type="button"
          onClick={() => handleNavClick("All")}
        >
          All
        </button>
        {categories.map((category) => (
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
        {products.length === 0 ? (
          <p className="empty-state">No products available.</p>
        ) : (
          <section className="all-products">
            <div className="category-grid">
              {(activeCategory === "All" ? products : productsByCategory[activeCategory] || []).map((product, index) => (
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