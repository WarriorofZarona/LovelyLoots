import React, { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_CATEGORIES, QUERY_PRODUCTS } from "../utils/queries";
import { useStoreContext } from "../utils/GlobalState";
import { UPDATE_CATEGORIES, UPDATE_PRODUCTS } from "../utils/actions";
import ProductItem from "../components/ProductInfo";
import { idbPromise } from "../utils/helpers";

const ProductSearch = () => {
  const [state, dispatch] = useStoreContext();

  const { categories, currentCategory } = state;

  const { loading: categoryLoading, data: categoryData } = useQuery(QUERY_CATEGORIES);
  const { loading: productLoading, data: productData } = useQuery(QUERY_PRODUCTS, {
    variables: { category: currentCategory },
  });

  useEffect(() => {
    if (categoryData) {
      dispatch({
        type: UPDATE_CATEGORIES,
        categories: categoryData.categories,
      });
      categoryData.categories.forEach((category) => {
        idbPromise("categories", "put", category);
      });
    } else if (!categoryLoading) {
      idbPromise("categories", "get").then((categories) => {
        dispatch({
          type: UPDATE_CATEGORIES,
          categories,
        });
      });
    }
  }, [categoryData, categoryLoading, dispatch]);

  useEffect(() => {
    if (productData) {
      dispatch({
        type: UPDATE_PRODUCTS,
        products: productData.products,
      });
      productData.products.forEach((product) => {
        idbPromise("products", "put", product);
      });
    } else if (!productLoading) {
      idbPromise("products", "get").then((products) => {
        dispatch({
          type: UPDATE_PRODUCTS,
          products,
        });
      });
    }
  }, [productData, productLoading, dispatch]);

  const filteredProducts = state.products.filter((product) =>
    currentCategory ? product.category._id === currentCategory : true
  );

  return (
    <main>
      <div className="container">
        <h2>Our Products</h2>
        {filteredProducts.length ? (
          <div className="product-list">
            {filteredProducts.map((product) => (
              <ProductItem key={product._id} {...product} />
            ))}
          </div>
        ) : (
          <h3>Sorry, no loot found in this category!</h3>
        )}
      </div>
    </main>
  );
};

export default ProductSearch;
