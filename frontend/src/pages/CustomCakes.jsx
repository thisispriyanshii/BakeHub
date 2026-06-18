import { useState } from "react";
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
import "./CustomCakes.css";

const occasionOptions = [
  { label: "Birthday", icon: "🎂" },
  { label: "Anniversary", icon: "💍" },
  { label: "Baby Shower", icon: "👶" },
  { label: "Graduation", icon: "🎓" },
  { label: "Corporate Event", icon: "💼" },
  { label: "Other", icon: "✨" },
];

const shapeOptions = [
  { label: "Round", image: customCakeRound },
  { label: "Square", image: customCakeSquare },
  { label: "Heart", image: customCakeHeart },
  { label: "Rectangle", image: customCakeRectangle },
];

const flavorOptions = [
  { label: "Chocolate Truffle", image: chocolateTruffleImg },
  { label: "Red Velvet", image: redVelvetImg },
  { label: "Black Forest", image: blackForestImg },
  { label: "Butterscotch", image: butterscotchImg },
  { label: "Vanilla", image: vanillaImg },
  { label: "Blueberry", image: blueberryImg },
  { label: "Strawberry", image: strawberryImg },
];

const weightOptions = [
  { weight: "0.5 Kg", serves: "2-4 people" },
  { weight: "1 Kg", serves: "4-6 people" },
  { weight: "1.5 Kg", serves: "6-8 people" },
  { weight: "2 Kg", serves: "8-10 people" },
  { weight: "3 Kg", serves: "10-15 people" },
];

const frostingOptions = [
  { label: "Buttercream", image: buttercreamImg },
  { label: "Whipped Cream", image: whippedCreamImg },
  { label: "Fondant", image: fondantImg },
  { label: "Semi-Naked", image: semiNakedImg },
  { label: "Drip Cake", image: dripCakeImg },
];

const toppingOptions = [
  { name: "Extra Chocolate", price: 100 },
  { name: "Fresh Fruits", price: 150 },
  { name: "Gold Foil", price: 250 },
  { name: "Macarons", price: 200 },
  { name: "Sprinkles", price: 50 },
];

const weightPriceMap = {
  "0.5 Kg": 899,
  "1 Kg": 1299,
  "1.5 Kg": 1599,
  "2 Kg": 1899,
  "3 Kg": 2399,
};

const toppingPriceMap = {
  "Extra Chocolate": 120,
  "Fresh Fruits": 100,
  "Gold Foil": 220,
  "Macarons": 140,
  "Sprinkles": 60,
};

function CustomCakes() {
  const [occasion, setOccasion] = useState(occasionOptions[0].label);
  const [shape, setShape] = useState(shapeOptions[0].label);
  const [flavor, setFlavor] = useState(flavorOptions[0].label);
  const [weight, setWeight] = useState(weightOptions[1].weight);
  const [frosting, setFrosting] = useState(frostingOptions[0].label);
  const [toppings, setToppings] = useState([]);
  const [message, setMessage] = useState("Happy Birthday Mom ❤️");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [referenceImage, setReferenceImage] = useState(null);

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

  const estimatedPrice =
    (weightPriceMap[weight] || 1299) +
    toppings.reduce((sum, topping) => sum + (toppingPriceMap[topping] || 0), 0);

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
          <article className="step-card">
            <div className="step-head">
              <span>Step 1</span>
              <h2>Choose Occasion</h2>
            </div>
            <div className="option-grid occasions">
              {occasionOptions.map((option) => (
                <button
                  key={option.label}
                  className={`option-pill ${occasion === option.label ? "selected" : ""}`}
                  type="button"
                  onClick={() => setOccasion(option.label)}
                >
                  <span className="option-icon">{option.icon}</span>
                  {option.label}
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
                  key={shapeOption.label}
                  className={`shape-card ${shape === shapeOption.label ? "selected" : ""}`}
                  type="button"
                  onClick={() => setShape(shapeOption.label)}
                >
                  <img src={shapeOption.image} alt={`${shapeOption.label} cake`} />
                  <span>{shapeOption.label}</span>
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
                  key={flavorOption.label}
                  className={`flavor-card ${flavor === flavorOption.label ? "selected" : ""}`}
                  type="button"
                  onClick={() => setFlavor(flavorOption.label)}
                >
                  <img src={flavorOption.image} alt={flavorOption.label} />
                  <span>{flavorOption.label}</span>
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
                  key={weightOption.weight}
                  className={`option-pill ${weight === weightOption.weight ? "selected" : ""}`}
                  type="button"
                  onClick={() => setWeight(weightOption.weight)}
                >
                  <div>{weightOption.weight}</div>
                  <small>{weightOption.serves}</small>
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
                  key={option.label}
                  className={`style-card ${frosting === option.label ? "selected" : ""}`}
                  type="button"
                  onClick={() => setFrosting(option.label)}
                >
                  <img src={option.image} alt={option.label} />
                  <span>{option.label}</span>
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
              <h2>Delivery Date & Time</h2>
            </div>
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
                <span>Message</span>
                <strong>{message || "Your message here"}</strong>
              </div>
              <div>
                <span>Reference</span>
                <strong>{referenceImage ? "Uploaded" : "Not added"}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>{deliveryDate && deliveryTime ? `${deliveryDate} · ${deliveryTime}` : "Select date and time"}</strong>
              </div>
            </div>

            <div className="price-panel">
              <span>Estimated Price</span>
              <strong>₹{estimatedPrice}</strong>
            </div>

            <div className="preview-buttons">
              <button type="button" className="primary-btn">Request Custom Cake</button>
              <button type="button" className="secondary-btn">Add To Cart</button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CustomCakes;
