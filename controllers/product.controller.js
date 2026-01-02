import { ObjectId } from "@fastify/mongodb";
import { generateUniqueSlug } from "../utils/generateUniqueSlug.js";
import { title } from "process";

export const addProduct = async (request, reply) => {
  try {

      const db = request.server.mongo.db;
      if (!db) {
        return reply.code(500).send({
          success: false,
          message: 'Database connection not available'
        });
      }
      const collection = db.collection('products');
      const productCategoryCollection = db.collection('productCategories');

      const {productCategoryId} = request.body;

      if(!ObjectId.isValid(productCategoryId)) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid product category ID'
        });
      }
      const category = await productCategoryCollection.findOne({ _id: new ObjectId(productCategoryId) });
      if (!category) {
        return reply.code(404).send({
          success: false,
          message: 'Product category not found'
        });
      }


      const slug = await generateUniqueSlug(request.body.title, collection);

    const productData = {
      title: request.body.title,
      slug,
      description: request.body.description,
      product_price: request.body.product_price,
      productCategoryId: new ObjectId(productCategoryId),
      sku: request.body.sku,
      image_url: request.body.image_url,
      status: request.body.status,
      meta_title: request.body.meta_title,
      meta_description: request.body.meta_description,
      meta_keywords: request.body.meta_keywords,
      showingOnHomePage: request.body.showingOnHomePage,
      amazon_link: `https://www.amazon.in/${slug}/dp/${request.body.sku}/ref=sr_1_1`,
      createdAt: new Date()
    };

    const result = await collection.insertOne(productData);

    reply.code(201).send({
      success: true,
      message: 'Product added successfully',
      id: result.insertedId
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


export const updateProduct = async (request, reply) => {
  try{
      const {slug}=request.params;
      const body=request.body;

      const db = request.server.mongo.db;
      if (!db) {
        return reply.code(500).send({
          success: false,
          message: 'Database connection not available'
        });
      }


      const collection = db.collection('products');
      const productCategoryCollection = db.collection('productCategories');

      const existingProduct = await collection.findOne({ slug });

      if (!existingProduct) {
        return reply.code(404).send({
          success: false,
          message: 'Product not found'
        });
      }

      if(!ObjectId.isValid(body.productCategoryId)) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid product category ID'
        });
      }
      const category = await productCategoryCollection.findOne({ _id: new ObjectId(body.productCategoryId) });
      if (!category) {
        return reply.code(404).send({
          success: false,
          message: 'Product category not found'
        });
      }


      // If title is being updated, generate a new unique slug
      let updatedSlug = slug;
      if (body.title && body.title !== existingProduct.title) {
        updatedSlug = await generateUniqueSlug(body.title, collection);
      }


      const updatedData = {
        title: body.title,
        description: body.description,
        product_price: body.product_price,
        productCategoryId: new ObjectId(body.productCategoryId),
        sku: body.sku,
        image_url: body.image_url,
        status: body.status,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        meta_keywords: body.meta_keywords,
        showingOnHomePage: body.showingOnHomePage,
        slug: updatedSlug,
        amazon_link: `https://www.amazon.in/${updatedSlug}/dp/${body.sku}/ref=sr_1_1`,
        updatedAt: new Date()
      };

      await collection.updateOne({ slug }, { $set: updatedData });

      reply.code(200).send({
        success: true,
        message: 'Product updated successfully'
      });
    }
      catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
  }


export const fetchProducts = async (request, reply) => {
  try {
    const db = request.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }
    const collection = db.collection('products');
    const page=  request.query.page || 1;
    const limit= request.query.limit || 9;
    const search= request.query.search || "";
    
    const query = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};
    const products = await collection
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const totalCount = await collection.countDocuments(query);

    reply.code(200).send({
      success: true,
      data: products,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
}
  
export const fetchProductDetails = async (request, reply) => {
  try {
    const { slug } = request.params;

    const db = request.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }
    const collection = db.collection('products');

    const product = await collection.findOne({ slug });

    if (!product) {
      return reply.code(404).send({
        success: false,
        message: 'Product not found'
      });
    }

    reply.code(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
}


export const deleteProduct = async (request, reply) => {
  try {
    const { id } = request.params;

    const db = request.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }
    const collection = db.collection('products');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return reply.code(404).send({
        success: false,
        message: 'Product not found'
      });
    }
    
    reply.code(200).send({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
}


export const fetchProductsForHomePage = async (request, reply) => {
  try {
    const db = request.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }
    const collection = db.collection('products');
    
    const products = await collection.find({ status: 'active', showingOnHomePage: true }).toArray();
    reply.code(200).send({
      success: true,
      data: products
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
}



export const fetchProductsByCategory = async (request, reply) => {
  try {
    const { slug } = request.params;
      
    const db = request.server.mongo.db;
    const productCollection = db.collection('products');
    const categoryCollection = db.collection('productCategories');

    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 9;
    const search = request.query.search || "";

    // ✅ Step 1: Find category by slug
    const category = await categoryCollection.findOne({ slug });

    if (!category) {
      return reply.code(404).send({
        success: false,
        message: 'Category not found'
      });
    }


    // ✅ Step 2: Find products by categoryId
    const query = {
      productCategoryId: category._id
    };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const products = await productCollection
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await productCollection.countDocuments(query);

    return reply.send({
      success: true,
      category: {
        id: category._id,
        title: category.title,
        slug: category.slug
      },
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
};



export const fetchRelatedProducts = async (request, reply) => {
  try {
    const { id } = request.params;
    console.log("Product ID:", id);
    // console.log("Product ID:", request.params);

    const limit = parseInt(request.query.limit) || 4;

    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: 'Invalid product id'
      });
    }

    const db = request.server.mongo.db;
    const productCollection = db.collection('products');

    // ✅ Step 1: Current product
    const product = await productCollection.findOne({
              _id: new ObjectId(id)
    });

    if (!product) {
      return reply.code(404).send({
        success: false,
        message: 'Product not found'
      });
    }

    // ✅ Step 2: Related products (same category)
    const relatedProducts = await productCollection
      .find({
        productCategoryId: product.productCategoryId, // same category
        _id: { $ne: product._id }, // exclude current product
        status: 'active'
      })
      .limit(limit)
      .toArray();
 
    return reply.send({
      success: true,
      data: relatedProducts
    });

  } catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
};