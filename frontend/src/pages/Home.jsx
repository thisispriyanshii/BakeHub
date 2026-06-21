import { Link } from "react-router-dom"; // Import Link for internal routing
import Navbar from "./Navbar";
import mainimage from "./banner.png";
import banner3 from "./3banner.png";
import banner4 from "./4banner.png";
import brownies from "./brownie.png";
import cupcakes from "./cupcakes.png";
import dessertbox from "./dessertbox.png";
import cookies from "./cookies.png";
import hampers from "./hampers.png";
import cakes from "./cake.png";
import "./Home.css";
import {FaBirthdayCake} from "react-icons/fa";

function Home() {
  return (
    <div className="home-page">
      <Navbar />

      {/* Banner */}
      <section className="banner container-fluid p-0">
        <img src={mainimage} alt="BakeHub Banner" className="banner-image" />

        <div className="banner-content">
          <h1>Every Celebration<br />Starts Here</h1>
          <p>From brownies and cupcakes to custom cakes<br />and dessert boxes, we make every occasion memorable.</p>

          <div className="button-group">
            <Link to="/menu" className="btn btn-primary">Explore Menu →</Link>
             <Link to="/custom-cakes" className="btn btn-secondary">
             Customize Cake <FaBirthdayCake style={{marginLeft: '8px'}}/>
           </Link>
          </div>
        </div>
      </section>

      {/* What Would You Love Section */}
      <section className="love-section">
        <div className="love-content">
          <h2>Crafted with Love, Just for You ✨</h2>
        </div>
      </section>

      {/* Cards Section */}
      <section className="container cards-section">
        <div className="row g-4 justify-content-center">

          {/* Card 1: Brownies */}
          <div className="col-12 col-sm-6 col-md-4 col-lg-2">
            <Link to="/menu?category=brownies" className="card category-card">
              <div className="card-img-container">
                <img src={brownies} className="card-img-top" alt="Brownies" />
              </div>
              <div className="card-body">
                <h6>Brownies</h6>
                <div className="arrow-btn">&rarr;</div>
              </div>
            </Link>
          </div>

          {/* Card 2: Cupcakes */}
          <div className="col-12 col-sm-6 col-md-4 col-lg-2">
            <Link to="/menu?category=cupcakes" className="card category-card">
              <div className="card-img-container">
                <img src={cupcakes} className="card-img-top" alt="Cupcakes" />
              </div>
              <div className="card-body">
                <h6>Cupcakes</h6>
                <div className="arrow-btn">&rarr;</div>
              </div>
            </Link>
          </div>

          {/* Card 3: Cookies */}
          <div className="col-12 col-sm-6 col-md-4 col-lg-2">
            <Link to="/menu?category=cookies" className="card category-card">
              <div className="card-img-container">
                <img src={cookies} className="card-img-top" alt="Cookies" />
              </div>
              <div className="card-body">
                <h6>Cookies</h6>
                <div className="arrow-btn">&rarr;</div>
              </div>
            </Link>
          </div>

          {/* Card 4: Dessert Boxes */}
          <div className="col-12 col-sm-6 col-md-4 col-lg-2">
            <Link to="/menu?category=dessert%20boxes" className="card category-card">
              <div className="card-img-container">
                <img src={dessertbox} className="card-img-top" alt="Dessert Boxes" />
              </div>
              <div className="card-body">
                <h6>Dessert Boxes</h6>
                <div className="arrow-btn">&rarr;</div>
              </div>
            </Link>
          </div>

          {/* Card 5: Hampers */}
          <div className="col-12 col-sm-6 col-md-4 col-lg-2">
            <Link to="/menu?category=hampers" className="card category-card">
              <div className="card-img-container">
                <img src={hampers} className="card-img-top" alt="Hampers" />
              </div>
              <div className="card-body">
                <h6>Hampers</h6>
                <div className="arrow-btn">&rarr;</div>
              </div>
            </Link>
          </div>

          {/* Card 6: Custom Cakes (Added to complete your set of 6) */}
          <div className="col-12 col-sm-6 col-md-4 col-lg-2">
            <Link to="/custom-cakes" className="card category-card">
              <div className="card-img-container">
                <img src={cakes} className="card-img-top" alt="Custom Cakes" />
              </div>
              <div className="card-body">
                <h6>Custom Cakes</h6>
                <div className="arrow-btn">&rarr;</div>
              </div>
            </Link>
          </div>

        </div>
      </section>

       {/* 3rd Banner */}
       <section className="banner3 container-fluid p-0">
           <img src={banner3} alt="BakeHub Banner3" className="banner-3" />
           <div className="banner3-overlay">
             <div className="banner3-content">
               <h2>Never Miss a Celebration</h2>
               <p>From birthdays and anniversaries to life's little milestones, BakeHub is here to make every celebration sweeter.</p>
               
             </div>
           </div>
       </section>
        {/* 4th Banner */}
        <section className="banner4 container-fluid p-0">
          <img src={banner4} alt="BakeHub Banner4" className="banner-4" />
          <div className="banner4-overlay">
            <div className="banner4-text">
              <p className="banner4-subtitle">our promise</p>
              <h2>Built in a Cloud Kitchen, Delivered with Love</h2>
              <p className="banner4-copy">
                Every treat is baked with the finest ingredients in our hygienic kitchen and delivered to your doorstep with care.
              </p>
              <Link to="/about" className="btn btn-primary banner4-btn">Know more about us</Link>
            </div>
          </div>
        </section>
    </div>
  );
}

export default Home;