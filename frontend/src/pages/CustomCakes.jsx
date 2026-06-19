import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import customCakeRound from "./customcakeround.png";
import customCakeSquare from "./customcakesquare.png";
import customCakeHeart from "./customcakeheart.png";
import customCakeRectangle from "./customcakerectangle.png";
import chocolateTruffleImg from "./chocolatetruffle.png";
import redVelvetImg from "./redvelvet.png";
import blackForestImg from "./blackforest.png";
import butterscotchImg from "./butterscotch.png";
import vanillaImg from "./vanilla.png";
import blueberryImg from "./blueberry.png";
import strawberryImg from "./strawberry.png";
import buttercreamImg from "./buttercream-frosting.png";
import whippedCreamImg from "./whippedcream-frosting.png";
import fondantImg from "./fondant-frosting.png";
import semiNakedImg from "./seminaked-frosting.png";
import dripCakeImg from "./dripcake-frosting.png";
import {
  fetchCustomizations,
  getToken,
  submitCustomCakeOrder,
} from "../api/client";
import "./CustomCakes.css";

const occasionIcons = {
  Birthday: "🎂",
  Anniversary: "💍",
  Other: "✨",
};

const shapeImages = {
  Round: customCakeRound,
  Square: customCakeSquare,
  Heart: customCakeHeart,
  Rectangle: customCakeRectangle,
};

const flavorImages = {
  "Chocolate Truffle": chocolateTruffleImg,
  "Red Velvet": redVelvetImg,
  "Black Forest": blackForestImg,
  Butterscotch: butterscotchImg,
  Vanilla: vanillaImg,
  Blueberry: blueberryImg,
  Strawberry: strawberryImg,
};

const frostingImages = {
  Buttercream: buttercreamImg,
  "Whipped Cream": whippedCreamImg,
  Fondant: fondantImg,
  "Semi-Naked": semiNakedImg,
  "Drip Cake": dripCakeImg,
};

const weightServesMap = {
  "0.5 Kg": "2-4 people",
  "1 Kg": "4-6 people",
  "1.5 Kg": "6-8 people",
  "2 Kg": "8-10 people",
  "3 Kg": "10-15 people",
};

const ALLOWED_OCCASIONS = ["Birthday", "Anniversary", "Other"];

const defaultOccasions = [...ALLOWED_OCCASIONS];

const defaultShapes = ["Round", "Square", "Heart", "Rectangle"];

const defaultFlavors = [
  "Chocolate Truffle",
  "Red Velvet",
  "Black Forest",
  "Butterscotch",
  "Vanilla",
  "Blueberry",
  "Strawberry",
];

const defaultWeights = [
  { name: "0.5 Kg", price: 899 },
  { name: "1 Kg", price: 1299 },
  { name: "1.5 Kg", price: 1599 },
  { name: "2 Kg", price: 1899 },
  { name: "3 Kg", price: 2399 },
];

const defaultFrostings = [
  "Buttercream",
  "Whipped Cream",
  "Fondant",
  "Semi-Naked",
  "Drip Cake",
];

const defaultToppings = [
  { name: "Extra Chocolate", price: 120 },
  { name: "Fresh Fruits", price: 100 },
  { name: "Gold Foil", price: 220 },
  { name: "Macarons", price: 140 },
  { name: "Sprinkles", price: 60 },
];

function mapOptionsByType(options, type) {
  return options
    .filter((option) => option.type === type)
    .map((option) => ({
      name: option.name,
      price: option.priceModifier || 0,
    }));
}

function CustomCakes() {
  const navigate = useNavigate();
  const [occasion, setOccasion] = useState(defaultOccasions[0]);
  const [shape, setShape] = useState(defaultShapes[0]);
  const [flavor, setFlavor] = useState(defaultFlavors[0]);
  const [weight, setWeight] = useState(defaultWeights[1].name);
  const [frosting, setFrosting] = useState(defaultFrostings[0]);
  const [toppings, setToppings] = useState([]);
  const [message, setMessage] = useState("Happy Birthday Mom ❤️");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [referenceImage, setReferenceImage] = useState(null);
  const [occasionOptions, setOccasionOptions] = useState(defaultOccasions);
  const [shapeOptions, setShapeOptions] = useState(defaultShapes);
  const [flavorOptions, setFlavorOptions] = useState(defaultFlavors);
  const [weightOptions, setWeightOptions] = useState(defaultWeights);
  const [frostingOptions, setFrostingOptions] = useState(defaultFrostings);
  const [toppingOptions, setToppingOptions] = useState(defaultToppings);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;

    async function loadCustomizations() {
      try {
        const options = await fetchCustomizations();
        if (!active || !Array.isArray(options) || options.length === 0) {
          return;
        }

        const occasions = mapOptionsByType(options, "occasion")
          .map((item) => item.name)
          .filter((name) => ALLOWED_OCCASIONS.includes(name));
        const shapes = mapOptionsByType(options, "shape").map((item) => item.name);
        const flavors = mapOptionsByType(options, "flavor").map((item) => item.name);
        const weights = mapOptionsByType(options, "weight");
        const frostings = mapOptionsByType(options, "frosting").map((item) => item.name);
        const toppingsFromApi = mapOptionsByType(options, "topping");

        if (occasions.length) {
          setOccasionOptions(occasions);
          setOccasion(occasions[0]);
        }
        if (shapes.length) {
          setShapeOptions(shapes);
          setShape(shapes[0]);
        }
        if (flavors.length) {
          setFlavorOptions(flavors);
          setFlavor(flavors[0]);
        }
        if (weights.length) {
          setWeightOptions(weights);
          setWeight(weights[0].name);
        }
        if (frostings.length) {
          setFrostingOptions(frostings);
          setFrosting(frostings[0]);
        }
        if (toppingsFromApi.length) {
          setToppingOptions(toppingsFromApi);
        }
      } catch {
        if (active) {
          setFeedback({
            type: "error",
            message: "Could not load customization options. Using default menu.",
          });
        }
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    }

    loadCustomizations();

    return () => {
      active = false;
    };
  }, []);

  const weightPriceMap = useMemo(
    () =>
      weightOptions.reduce((map, option) => {
        map[option.name] = option.price;
        return map;
      }, {}),
    [weightOptions]
  );

  const toppingPriceMap = useMemo(
    () =>
      toppingOptions.reduce((map, option) => {
        map[option.name] = option.price;
        return map;
      }, {}),
    [toppingOptions]
  );

  const estimatedPrice =
    (weightPriceMap[weight] || 1299) +
    toppings.reduce((sum, topping) => sum + (toppingPriceMap[topping] || 0), 0);

  const handleToppingToggle = (option) => {
    setToppings((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReferenceImage(URL.createObjectURL(file));
    }
  };

  const buildOrderPayload = () => ({
    occasion,
    shape,
    flavor,
    weight,
    frosting,
    toppings,
    message,
    deliveryDate,
    deliveryTime,
    deliveryAddress,
    hasReferenceImage: Boolean(referenceImage),
  });

  const validateOrder = () => {
    if (!deliveryAddress.trim()) {
      return "Please enter a delivery address.";
    }
    if (!deliveryDate) {
      return "Please choose a delivery date.";
    }
    if (!deliveryTime) {
      return "Please choose a delivery time.";
    }
    return "";
  };

  const handleRequestCustomCake = async () => {
    const validationError = validateOrder();
    if (validationError) {
      setFeedback({ type: "error", message: validationError });
      return;
    }

    if (!getToken()) {
      setFeedback({ type: "error", message: "Please log in to request a custom cake." });
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      await submitCustomCakeOrder(buildOrderPayload());
      setFeedback({
        type: "success",
        message: "Custom cake request submitted successfully.",
      });
      navigate("/orders");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to submit your custom cake request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    const validationError = validateOrder();
    if (validationError) {
      setFeedback({ type: "error", message: validationError });
      return;
    }

    const cartItem = {
      id: Date.now(),
      ...buildOrderPayload(),
      estimatedPrice,
      createdAt: new Date().toISOString(),
    };

    const existingCart = JSON.parse(localStorage.getItem("bakehub_cart") || "[]");
    localStorage.setItem("bakehub_cart", JSON.stringify([...existingCart, cartItem]));
    window.dispatchEvent(new Event("cart-updated"));

    setFeedback({
      type: "success",
      message: "Custom cake added to cart.",
    });
  };

  return (
    <div className="custom-cakes-page">
      <Navbar />
      <section className="custom-hero">
        <div className="hero-copy">
          <span className="eyebrow">Design Your Dream Cake</span>
          <h1>Design Your Dream Cake 🎂</h1>
          <p>
            Choose flavors, size, frosting, theme and message. We'll bake it exactly the way
            you imagine.
          </p>
        </div>
      </section>

      <main className="builder-grid">
        <section className="builder-panel">
          {loadingOptions && (
            <p className="builder-status">Loading customization options...</p>
          )}

          {feedback.message && (
            <p className={`builder-status ${feedback.type}`}>{feedback.message}</p>
          )}

          <article className="step-card">
            <div className="step-head">
              <span>Step 1</span>
              <h2>Choose Occasion</h2>
            </div>
            <div className="option-grid occasions">
              {occasionOptions.map((option) => (
                <button
                  key={option}
                  className={`option-pill ${occasion === option ? "selected" : ""}`}
                  type="button"
                  onClick={() => setOccasion(option)}
                >
                  <span className="option-icon">{occasionIcons[option] || "✨"}</span>
                  {option}
                </button>
              ))}
            </div>
          </article>

          <article className="step-card">
            <div className="step-head">
              <span>Step 2</span>
              <h2>Choose Cake Shape</h2>
            </div>
            <div className="shape-grid">
              {shapeOptions.map((shapeOption) => (
                <button
                  key={shapeOption}
                  className={`shape-card ${shape === shapeOption ? "selected" : ""}`}
                  type="button"
                  onClick={() => setShape(shapeOption)}
                >
                  <img
                    src={shapeImages[shapeOption]}
                    alt={`${shapeOption} cake`}
                  />
                  <span>{shapeOption}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="step-card">
            <div className="step-head">
              <span>Step 3</span>
              <h2>Choose Flavor</h2>
            </div>
            <div className="flavor-grid">
              {flavorOptions.map((flavorOption) => (
                <button
                  key={flavorOption}
                  className={`flavor-card ${flavor === flavorOption ? "selected" : ""}`}
                  type="button"
                  onClick={() => setFlavor(flavorOption)}
                >
                  <img src={flavorImages[flavorOption]} alt={flavorOption} />
                  <span>{flavorOption}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="step-card compact-card">
            <div className="step-head">
              <span>Step 4</span>
              <h2>Choose Weight</h2>
            </div>
            <div className="option-grid weights">
              {weightOptions.map((weightOption) => (
                <button
                  key={weightOption.name}
                  className={`option-pill ${weight === weightOption.name ? "selected" : ""}`}
                  type="button"
                  onClick={() => setWeight(weightOption.name)}
                >
                  <div>{weightOption.name}</div>
                  <small>{weightServesMap[weightOption.name] || "Custom size"}</small>
                </button>
              ))}
            </div>
          </article>

          <article className="step-card">
            <div className="step-head">
              <span>Step 5</span>
              <h2>Choose Frosting Style</h2>
            </div>
            <div className="frosting-grid">
              {frostingOptions.map((option) => (
                <button
                  key={option}
                  className={`style-card ${frosting === option ? "selected" : ""}`}
                  type="button"
                  onClick={() => setFrosting(option)}
                >
                  <img src={frostingImages[option]} alt={option} />
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="step-card upload-card">
            <div className="step-head">
              <span>Step 6</span>
              <h2>Upload Reference Image</h2>
            </div>
            <div className="upload-block">
              <label htmlFor="reference-image" className="upload-placeholder">
                {referenceImage ? (
                  <img src={referenceImage} alt="Reference" />
                ) : (
                  <>
                    <span>Upload inspiration image</span>
                    <small>Pinterest screenshot, moodboard or sketch</small>
                  </>
                )}
              </label>
              <input
                id="reference-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </article>

          <article className="step-card message-card">
            <div className="step-head">
              <span>Step 7</span>
              <h2>Cake Message</h2>
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Happy Birthday Mom ❤️"
            />
          </article>

          <article className="step-card">
            <div className="step-head">
              <span>Step 8</span>
              <h2>Additional Toppings</h2>
            </div>
            <div className="toppings-grid">
              {toppingOptions.map((option) => (
                <label
                  key={option.name}
                  className={`topping-pill ${
                    toppings.includes(option.name) ? "selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={toppings.includes(option.name)}
                    onChange={() => handleToppingToggle(option.name)}
                  />
                  <span>
                    {option.name} (+₹{option.price})
                  </span>
                </label>
              ))}
            </div>
          </article>

          <article className="step-card compact-card">
            <div className="step-head">
              <span>Step 9</span>
              <h2>Delivery Details</h2>
            </div>
            <div className="delivery-details">
              <label>
                Delivery Address
                <textarea
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="House number, street, city, pin code"
                />
              </label>
              <div className="date-time-grid">
                <label>
                  Delivery Date
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(event) => setDeliveryDate(event.target.value)}
                  />
                </label>
                <label>
                  Delivery Time
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(event) => setDeliveryTime(event.target.value)}
                  />
                </label>
              </div>
            </div>
          </article>
        </section>

        <aside className="preview-panel">
          <div className="preview-card">
            <h2>Cake Summary</h2>
            <div className="summary-list">
              <div>
                <span>Occasion</span>
                <strong>{occasion}</strong>
              </div>
              <div>
                <span>Shape</span>
                <strong>{shape}</strong>
              </div>
              <div>
                <span>Flavor</span>
                <strong>{flavor}</strong>
              </div>
              <div>
                <span>Weight</span>
                <strong>{weight}</strong>
              </div>
              <div>
                <span>Frosting</span>
                <strong>{frosting}</strong>
              </div>
              <div>
                <span>Toppings</span>
                <strong>{toppings.length ? toppings.join(", ") : "None"}</strong>
              </div>
              <div>
                <span>Message</span>
                <strong>{message || "Your message here"}</strong>
              </div>
              <div>
                <span>Reference</span>
                <strong>{referenceImage ? "Uploaded" : "Not added"}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>
                  {deliveryDate && deliveryTime
                    ? `${deliveryDate} · ${deliveryTime}`
                    : "Select date and time"}
                </strong>
              </div>
              <div>
                <span>Address</span>
                <strong>{deliveryAddress || "Add delivery address"}</strong>
              </div>
            </div>

            <div className="price-panel">
              <span>Estimated Price</span>
              <strong>₹{estimatedPrice}</strong>
            </div>

            <div className="preview-buttons">
              <button
                type="button"
                className="primary-btn"
                onClick={handleRequestCustomCake}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Request Custom Cake"}
              </button>
              <button type="button" className="secondary-btn" onClick={handleAddToCart}>
                Add To Cart
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CustomCakes;
