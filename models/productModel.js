// In-memory storage for products
let products = [];
let nextId = 1;

// Get all products
export const getAllProducts = () => {
  return products;
};

// Get product by ID
export const getProductById = (id) => {
  return products.find(p => p.id === id);
};

// Get product by SKU
export const getProductBySku = (sku) => {
  return products.find(p => p.sku === sku);
};

// Create new product
export const createProduct = (productData) => {
  const newProduct = {
    id: nextId++,
    ...productData,
    status: productData.status || 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  products.push(newProduct);
  return newProduct;
};

// Update product
export const updateProduct = (id, productData) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return null;
  }
  
  products[index] = {
    ...products[index],
    ...productData,
    updated_at: new Date().toISOString()
  };
  
  return products[index];
};

// Delete product
export const deleteProduct = (id) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return false;
  }
  
  products.splice(index, 1);
  return true;
};

// Get products count
export const getProductsCount = () => {
  return products.length;
};







