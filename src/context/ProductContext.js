import React, { createContext, useContext, useState, useEffect } from 'react';
import { productService } from '../services/productService';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await productService.getAllProducts();
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductById = (pid) => {
    return products.find(p => p.pid === pid);
  };

  const getProductsByCategory = (category) => {
    return products.filter(p => p.category === category);
  };

  const searchProducts = async (query) => {
    try {

      const searchResults = await productService.searchProducts(query);
      return searchResults;
    } catch (err) {
      console.error('Error searching products:', err);
      const q = query.toLowerCase();
      return products.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.subcategory || '').toLowerCase().includes(q)
      );
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      error,
      getProductById,
      getProductsByCategory,
      searchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};
