// Example: Fetch products from Shopify Storefront API
import { useEffect, useState } from "react";

const SHOPIFY_DOMAIN = "shopeasei.myshopify.com";
const STOREFRONT_TOKEN = "4be32d49a6d8bb514bfab052dae18199-1750727123";

function useShopifyProducts() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch(`https://${SHOPIFY_DOMAIN}/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: `
          {
            products(first: 10) {
              edges {
                node {
                  id
                  title
                  description
                  images(first: 1) { edges { node { src } } }
                  variants(first: 1) { edges { node { price } } }
                }
              }
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data.products.edges.map((edge) => edge.node));
      });
  }, []);
  return products;
}

export default useShopifyProducts;
