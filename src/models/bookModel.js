const { models } = require("mongoose");
const { Schema, model } = require("mongoose");
const slugify = require("slugify");

const bookSchema = new Schema(
	{
		bookName: {
			type: String,
			required: [true, "title is required"],
		},
		bookHeaderImage: {
			type: String,
			required: [true, "magazin header image is required"],
		},
		bookImages: {
			type: Array,
			required: [true, "magazin images is required"],
		},
		slug: {
			type: String,
			unique: true,
		},

		isPublished: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

bookSchema.pre("save", async function (next) {
	const originalSlug = slugify(this.bookName, {
		replacement: "-",
		remove: /[^\w\s]/g,
		lower: true,
		strict: false,
		locale: "vi",
		trim: true,
	});

	// Check for uniqueness
	const slugRegex = new RegExp(`^${originalSlug}(-[0-9]+)?`);
	const existingBooks = await this.constructor.find({
		slug: { $regex: slugRegex },
	});

	if (existingBooks.length > 0) {
		// If there are existing events with similar slugs, add a numerical suffix
		this.slug = `${originalSlug}-${existingBooks.length + 1}`;
	} else {
		// Otherwise, use the original slug
		this.slug = originalSlug;
	}

	next();
});

const BookModel = models.book || model("book", bookSchema);

module.exports = BookModel;
