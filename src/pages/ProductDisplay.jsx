
const ProductDisplay = () => {
  const products = useShopifyProducts();
  if (!products.length) {
    return <div className="min-h-[80vh] flex items-center justify-center">Loading products...</div>;
  }
  return (
    <div>
      {products.map((p) => (
        <div key={p.id}>
          <h3>{p.title}</h3>
          <img src={p.images.edges[0]?.node.src} alt={p.title} />
          <p>{p.description}</p>
          <p>Price: ₹{p.variants.edges[0]?.node.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductDisplay;
