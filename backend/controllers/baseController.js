const { asyncHandler } = require('../middlewares/errorHandler');

class BaseController {
  constructor(model) {
    this.model = model;
  }

  // Create a new document
  create = asyncHandler(async (req, res) => {
    const document = new this.model(req.body);
    await document.save();
    res.status(201).json({ 
      success: true, 
      message: `${this.model.modelName} created successfully`, 
      data: document 
    });
  });

  // Get all documents with optional filtering and pagination
  getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = '-createdAt', ...filter } = req.query;
    
    const skip = (page - 1) * limit;
    const documents = await this.model
      .find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await this.model.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  // Get document by ID
  getById = asyncHandler(async (req, res) => {
    const document = await this.model.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: `${this.model.modelName} not found` 
      });
    }
    res.status(200).json({ success: true, data: document });
  });

  // Update document by ID
  update = asyncHandler(async (req, res) => {
    const document = await this.model.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: `${this.model.modelName} not found` 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: `${this.model.modelName} updated successfully`, 
      data: document 
    });
  });

  // Delete document by ID
  delete = asyncHandler(async (req, res) => {
    const document = await this.model.findByIdAndDelete(req.params.id);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: `${this.model.modelName} not found` 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: `${this.model.modelName} deleted successfully` 
    });
  });

  // Count documents
  count = asyncHandler(async (req, res) => {
    const count = await this.model.countDocuments(req.query);
    res.status(200).json({ success: true, count });
  });
}

module.exports = BaseController; 