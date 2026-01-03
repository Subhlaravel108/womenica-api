import { ObjectId } from "@fastify/mongodb";
import { generateUniqueSlug } from "../utils/generateUniqueSlug.js";


export const createBlog = async (req, reply) => {
  try {
    const body = req.body || {};


    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const blogsCol = db.collection("blog");
    const blogCategory=db.collection("blogCategories")
    const slug = await generateUniqueSlug(body.title, blogsCol);

    // ✅ Tags ko JSON string me store karne ka logic
  let tags = [];

if (Array.isArray(body.tags)) {
  // agar frontend array bhej raha ho (e.g. ["travel","alps"])
  tags = body.tags.map((t) => String(t).trim()).filter(Boolean);
} else if (typeof body.tags === "string") {
  // agar frontend se plain text string aa rahi ho (e.g. "travel, alps")
  tags = body.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

  const {categoryId}=body
    if (!ObjectId.isValid(categoryId)) {
      return reply.code(400).send({
        success: false,
        message: "Validation Failed",
        errors: { categoryId: "Category is not a valid ObjectId" },
      });
    }

       const ctg = await blogCategory.findOne({ _id: new ObjectId(categoryId) });
    if (!ctg) {
      return reply.code(404).send({
        success: false,
        message: "category not found",
      });
    }
    const newBlog = {
      title: body.title.trim(),
      slug,
      author: body.author.trim(),
      categoryId: new ObjectId(categoryId),
      summary: body.summary.trim(),
      content: body.content,
      featuredImage: body.featuredImage,
      publishDate: body.publishDate ? new Date(body.publishDate) : null,
      showingOnHomePage: body.showingOnHomePage,
      status: body.status,
      tags, // ✅ JSON string form
      meta_title: body.meta_title?.trim() || body.title.trim(),
      meta_description: body.meta_description?.trim() || body.summary.trim(),
      meta_keywords: body.meta_keywords, // ✅ JSON string form
      published_at: body.status === "Published" ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await blogsCol.insertOne(newBlog);

    return reply.code(201).send({
      success: true,
      message: "Blog created successfully",
      data: { id: result.insertedId, slug },
    });
  } catch (err) {
    console.error("Create Blog Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};



export const updateBlogBySlug = async (req, reply) => {
  try {
    const { slug } = req.params;
    const body = req.body || {};

  

    // ✅ Get DB
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const blogsCol = db.collection("blog");
    const blogCategory=db.collection("blogCategories")

    // ✅ Find existing blog
    const existing = await blogsCol.findOne({ slug });
    if (!existing) {
      return reply.code(404).send({
        success: false,
        message: "Blog not found",
      });
    }

    // ✅ Handle tags properly
    let tags = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof body.tags === "string") {
      try {
        const parsed = JSON.parse(body.tags);
        if (Array.isArray(parsed)) tags = parsed.map((t) => t.trim());
        else
          tags = body.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
      } catch {
        tags = body.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    if(!ObjectId.isValid(body.categoryId)){
      return reply.code(400).send({
        success:false,
        message:"Invalid Category Id"
      })
    }

    const categoryExist=await blogCategory.findOne({
      _id:new ObjectId(body.categoryId)
    })

    if(!categoryExist){
      return reply.send(404).send({
        success:false,
        message:"Category not found"
      })
    }

    // ✅ If title changed → new slug generate karo
    let newSlug = slug;
    if (body.title && body.title.trim() !== existing.title) {
      newSlug = await generateUniqueSlug(body.title, blogsCol);
    }

    // ✅ Published_at logic
    let publishedAt = existing.published_at || null;
    if (
      body.status === "Published" &&
      (!existing.published_at || existing.status !== "Published")
    ) {
      publishedAt = new Date(); // newly published blog
    }

    // ✅ Prepare updated data
    const updatedBlog = {
      title: body.title.trim(),
      slug: newSlug,
      author: body.author?.trim(),
      categoryId: new ObjectId(body.categoryId),
      summary: body.summary?.trim(),
      content: body.content?.trim(),
      featuredImage: body.featuredImage,
      publishDate: body.publishDate ? new Date(body.publishDate) : null,
      showingOnHomePage: body.showingOnHomePage,
      status: body.status || "Draft",
      meta_title: body.meta_title?.trim(),
      meta_description: body.meta_description?.trim(),
      meta_keywords: body.meta_keywords,
      tags,
      published_at: publishedAt,
      updatedAt: new Date(),
    };

    // ✅ Update in DB
    await blogsCol.updateOne({ slug }, { $set: updatedBlog });

    return reply.code(200).send({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (err) {
    console.error("Update Blog Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


export const getBlogDetailsBySlug = async (req, reply) => {
    try {
        const { slug } = req.params;
        const db = req.mongo?.db || req.server?.mongo?.db;
        if (!db) {
            return reply.code(500).send({
                success: false,
                message: "Database connection not available",
            });
        }
        const blogsCol = db.collection("blog");
        const blog = await blogsCol.findOne({ slug });
        if (!blog) {
            return reply.code(404).send({
                success: false,
                message: "Blog not found",
            });
        }
        return reply.code(200).send({
            success: true,
            message: "Blog fetched successfully",
            data: blog,
        });
    } catch (err) {
        console.error("Get Blog Error:", err);
        return reply.code(500).send({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
};


export const getAllBlogs = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const blogsCol = db.collection("blog");

    // Query Params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search ? req.query.search.trim() : "";
    const download = req.query.download === "true";
    const type = req.query.type || "all";

    // Search Filter
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // =============== 🔽 DOWNLOAD MODE =============== //
    if (download) {
      const downloadFilter = { ...filter };

      if (type === "homepage") {
        downloadFilter.showingOnHomePage = true;
      }

      const totalDocuments = await blogsCol.countDocuments(downloadFilter);

      const allBlogs = await blogsCol
        .find(downloadFilter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const totalPages = Math.ceil(totalDocuments / limit);

      // JSON Format
      const jsonData = JSON.stringify(
        {
          success: true,
          pagination: {
            total: totalDocuments,
            page,
            limit,
            totalPages,
          },
          data: allBlogs,
        },
        null,
        2
      );

      // Correct Filename
      const fileName = type === "homepage" ? "blogs_homepage.json" : "all_blogs.json";

      reply.header("Content-Disposition", `attachment; filename=${fileName}`);
      reply.header("Content-Type", "application/json");

      return reply.code(200).send(jsonData);
    }

    // =============== 🔽 NORMAL MODE =============== //
    const totalBlogs = await blogsCol.countDocuments(filter);

    const blogs = await blogsCol
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(totalBlogs / limit);

    return reply.code(200).send({
      success: true,
      message: "Blogs fetched successfully",
      pagination: {
        total: totalBlogs,
        page,
        limit,
        totalPages,
      },
      data: blogs,
    });
  } catch (err) {
    console.error("Get All Blogs Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


export const deleteBlogById = async (req, reply) => {
    try{
        const {id}=req.params;
        const db = req.mongo?.db || req.server?.mongo?.db;
        if(!db){
            return reply.code(500).send({
                success:false,
                message:"Database connection not available",
            });
        }
        const blogsCol = db.collection("blog");
        const existing = await blogsCol.findOne({_id:new ObjectId(id)});
        if(!existing){
            return reply.code(404).send({
                success:false,
                message:"Blog not found",
            });
        }
        const result = await blogsCol.deleteOne({_id:new ObjectId(id)});
        if(result.deletedCount===0){
            return reply.code(500).send({
                success:false,
                message:"Failed to delete blog",
            });
        }
        return reply.code(200).send({
            success:true,
            message:"Blog deleted successfully",
        });
    }catch(err){
        console.error("Delete Blog Error:", err);
        return reply.code(500).send({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
    }



    export const getAllActiveBlogs = async (req, reply) => {
  try {
    const db = req.mongo?.db || req.server?.mongo?.db;
    if (!db) {
      return reply.code(500).send({
        success: false,
        message: "Database connection not available",
      });
    }

    const blogsCol = db.collection("blog");

    // Query Params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search ? req.query.search.trim() : "";

    // Search Filter
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

   

    // =============== 🔽 NORMAL MODE =============== //
    // const totalBlogs = await blogsCol.countDocuments(filter);

    const blogs = await blogsCol
      .find({ status: "Published", ...filter })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const totalBlogs = await blogsCol.countDocuments({ status: "Published", ...filter });

    const totalPages = Math.ceil(totalBlogs / limit);

    return reply.code(200).send({
      success: true,
      message: "Blogs fetched successfully",
      pagination: {
        total: totalBlogs,
        page,
        limit,
        totalPages,
      },
      data: blogs,
    });
  } catch (err) {
    console.error("Get All Blogs Error:", err);
    return reply.code(500).send({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};