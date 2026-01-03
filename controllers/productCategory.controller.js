import { ObjectId } from "mongodb";
import { generateUniqueSlug } from "../utils/generateUniqueSlug.js";
import { stat } from "fs";

export const addProductCategory = async (request, reply) => {
    try {
        const db = request.server.mongo.db;
        if (!db) {
            return reply.code(500).send({
                success: false,
                message: 'Database connection not available'
            });
        }
        const collection = db.collection('productCategories');
        const body=request.body;
        const slug = await generateUniqueSlug(body.title, collection);
        const categoryData = {
            title: body.title.trim(),
            description: body.description?.trim()|| "",
            meta_title: body.meta_title?.trim()|| "",
            meta_description: body.meta_description?.trim()|| "",
            meta_keywords: body.meta_keywords?.trim()|| "",
            image: body.image?.trim() || "",
            status: body.status,
            slug,
            showingOnHomePage: body.showingOnHomePage,
            createdAt: new Date()
        };
        const result = await collection.insertOne(categoryData);
        reply.code(201).send({
            success: true,
            message: 'Product Category added successfully',
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

export const updateProductCategory = async (request, reply) => {
    try {
        const { slug } = request.params;
        const body = request.body;
        const db = request.server.mongo.db;
        if (!db) {
            return reply.code(500).send({
                success: false, 
                message: 'Database connection not available'
            });
        }
        const collection = db.collection('productCategories');
        const existingCategory = await collection.findOne({ slug });
        if (!existingCategory) {
            return reply.code(404).send({
                success: false,
                message: 'Product Category not found'
            });
        }

        let updatedSlug = slug;
        if (body.title && body.title.trim() !== existingCategory.title) {
            updatedSlug = await generateUniqueSlug(body.title, collection);
        }


        const updatedData = {
            title: body.title?.trim() || existingCategory.title,
            description: body.description?.trim() || existingCategory.description,
            meta_title: body.meta_title?.trim() || existingCategory.meta_title,
            meta_description: body.meta_description?.trim() || existingCategory.meta_description,
            meta_keywords: body.meta_keywords?.trim() || existingCategory.meta_keywords,
            image: body.image?.trim() || existingCategory.image,
            status: body.status || existingCategory.status,
            slug: updatedSlug,
            showingOnHomePage: body.showingOnHomePage !== undefined ? body.showingOnHomePage : existingCategory.showingOnHomePage,
            updatedAt: new Date()
        };
        await collection.updateOne({ slug }, { $set: updatedData });
        reply.code(200).send({
            success: true,
            message: 'Product Category updated successfully'
        });
    } catch (error) {
        request.log.error(error);
        reply.code(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


export const fetchProductsCategories = async (request, reply) => {
  try {
    const db = request.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }
    const collection = db.collection('productCategories');
    const page= request.query.page ? parseInt(request.query.page) : 1;
    const limit= request.query.limit ? parseInt(request.query.limit) : 10;
    const search= request.query.search || "";
    // const query = {};

    // if (search) {
    //   query.$or = [
    //     { title: { $regex: search, $options: 'i' } },
    //     { description: { $regex: search, $options: 'i' } }
    //   ];
    // }

     const query = search
          ? { title: { $regex: search, $options: 'i' } }
          : {};

    const totalCategories = await collection.countDocuments(query);
    const categories = await collection.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    reply.code(200).send({
      success: true,
      data: categories,
        pagination: {
        total: totalCategories,
        page: page,
        limit: limit,
      }
    });
  } catch (error) {
    // request.log.error(error);
    reply.code(500).send({  
        success: false,
        message: 'Internal Server Error'
    });
  }
}


export const fetchProductCategoryBySlug = async (request, reply) => {
  try {
    const { slug } = request.params;
    const db = request.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }
    const collection = db.collection('productCategories');
    const category = await collection.findOne({ slug });
    if (!category) {
      return reply.code(404).send({
        success: false,
        message: 'Product Category not found'
      });
    }
    reply.code(200).send({
      success: true,
      data: category
    });
  }
    catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


// import { ObjectId } from 'mongodb';

export const deleteProductCategory = async (request, reply) => {
  try {
    const {id} = request.params;
    console.log(id)
    // if (!ObjectId.isValid(id)) {
    //   return reply.code(400).send({
    //     success: false,
    //     message: 'Invalid category id'
    //   });
    // }

    const db = request.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }

    const collection = db.collection('productCategories');

    const existingCategory = await collection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingCategory) {
      return reply.code(404).send({
        success: false,
        message: 'Product Category not found'
      });
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });

    return reply.code(200).send({
      success: true,
      message: 'Product Category deleted successfully'
    });

  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


export const getAllActiveProductCategories = async (request, reply) => {
  try {
    const db = request.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }
    const collection = db.collection('productCategories');
    const categories = await collection.find({ status: 'Active' })
      .sort({ createdAt: -1 })
      .toArray();
    return reply.code(200).send({
      success: true,
      data: categories
    });
  }
  catch (error) {
    request.log.error(error);
    reply.code(500).send({  
        success: false,
        message: 'Internal Server Error'
    });
  }
};

export const fetchAllActiveProductCategoriesForFrontend = async (request, reply) => {
  try {
    const db = request.server.mongo.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: 'Database connection not available'
      });
    }
    const collection = db.collection('productCategories');
    const page= request.query.page ? parseInt(request.query.page) : 1;
    const limit= request.query.limit ? parseInt(request.query.limit) : 9;
    const search= request.query.search || "";
    
    const query={
       status:"Active",
       showingOnHomePage:true,
       ...(search ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
       } : {}
       )
    }

    const total= await collection.countDocuments(query);
    const categories = await collection.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .toArray();

      if(total===0){
        return reply.code(200).send({
          success: true,
          message: 'No active Product Categories found',
          data: [],
          pagination: {
            total: 0,
            page: page,
            limit: limit,
            totalPages: 0
          },
        });
      }
    return reply.code(200).send({
      success: true,
      message: 'Active Product Categories fetched successfully',
      data: categories,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      },
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({    
        success: false,
        message: 'Internal Server Error'
    });
  }
};