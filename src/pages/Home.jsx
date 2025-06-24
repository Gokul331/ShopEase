import React from "react";
import Hero from "../components/Hero";
import FeaturedProducts from "../components/FeaturedProducts";
import CategoryList from "../components/CategoryList";
import Category from "../components/Category";
import { categoryItems } from "../data/categoryItems";
const Home = () => {
  return (
    <div>
      <CategoryList />
      <Hero />
      <FeaturedProducts />
      {
        (Object.keys(categoryItems)).map((category) => (
          <Category key={category} category={category} />
        ))
      }
    </div>
  );
};

export default Home;
