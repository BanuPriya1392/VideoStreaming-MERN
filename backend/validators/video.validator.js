const Joi = require("joi");

const VALID_TAGS = [
  "AI",
  "Music",
  "Gaming",
  "Live",
  "Tech",
  "Education",
  "Cinema",
  "Science",
  "Lifestyle",
  "Family",
  "Sports",
  "Vlog",
  "Other",
];

const fields = {
  title: Joi.string().min(2).max(200).trim(),
  author: Joi.string().min(1).max(100).trim(),
  tag: Joi.string().valid(...VALID_TAGS),
  views: Joi.string()
    .pattern(/^\d+(\.\d+)?[KMB]?$/)
    .message('views must be like "1.2M", "850K", or "10000"'),
  time: Joi.string().max(50).trim(),
  url: Joi.string().uri({ scheme: ["http", "https"] }),
  thumbnail: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .allow(""),
  description: Joi.string().max(500).trim().allow(""),
};

const createVideoSchema = Joi.object({
  title: fields.title.required(),
  author: fields.author.required(),
  tag: fields.tag.required(),
  views: fields.views.required(),
  time: fields.time.required(),
  url: fields.url.required(),
  thumbnail: fields.thumbnail.required(),
  description: fields.description.required(),
});

const updateVideoSchema = Joi.object({
  title: fields.title.required(),
  author: fields.author.required(),
  tag: fields.tag.required(),
  views: fields.views.required(),
  time: fields.time.required(),
  url: fields.url.required(),
  thumbnail: fields.thumbnail.required(),
  description: fields.description.required(),
});

const patchVideoSchema = Joi.object({
  title: fields.title,
  author: fields.author,
  tag: fields.tag,
  views: fields.views,
  time: fields.time,
  url: fields.url,
  thumbnail: fields.thumbnail,
  description: fields.description,
}).min(1);

const directUploadSchema = Joi.object({
  title: fields.title.required(),
  description: fields.description.optional(),
  tag: fields.tag.required(),
  tags: Joi.array().items(Joi.string()).optional(),
  author: fields.author.required(),
  duration: Joi.string().optional(),
  url: fields.url.required(),
  thumbnail: fields.thumbnail.required(),
});

const listQuerySchema = Joi.object({
  tag: Joi.string()
    .valid(...VALID_TAGS)
    .optional(),
  author: Joi.string().max(100).optional(),
  search: Joi.string().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "id must be a valid MongoDB ObjectId",
    "string.length": "id must be a valid MongoDB ObjectId",
  }),
});

/**
 * Middleware factory — validates req[source] against schema.
 * @param {Joi.Schema} schema
 * @param {'body'|'query'|'params'} source
 */
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const detail = error.details.map((d) => `${d.context?.key}: ${d.message}`).join(", ");
      return res.status(422).json({
        success: false,
        message: `Nexus Entry Denied [Validation Error]: ${detail}`,
        errors: error.details.map((d) => ({
          field: d.context?.key || d.path.join("."),
          message: d.message,
        })),
      });
    }

    req[source] = value;
    return next();
  };

module.exports = {
  validate,
  createVideoSchema,
  updateVideoSchema,
  patchVideoSchema,
  directUploadSchema,
  listQuerySchema,
  idParamSchema,
};
