type categoriesType =
  | "Produce"
  | "Dairy"
  | "Meat and Poultry"
  | "Bio"
  | "Bakery"
  | "Frozen Foods"
  | "Canned Goods"
  | "Beverages"
  | "Snacks"
  | "Condiments"
  | "Grains and Pasta"
  | "Baking Supplies"
  | "Cereal and Breakfast Foods"
  | "Canned Soups and Broths"
  | "Canned Vegetables and Fruits"
  | "Canned Beans and Legumes"
  | "Seafood"
  | "International Foods"
  | "Health Foods"
  | "Condiments and Sauces"
  | "Spices and Seasonings"
  | "Oils and Vinegars"
  | "Pasta Sauce"
  | "Snack Bars"
  | "Baby Care"
  | "Personal Care"
  | "Paper and Cleaning Products"
  | "Pet Supplies";

const categories = new Set<categoriesType>([
  "Produce",
  "Dairy",
  "Meat and Poultry",
  "Bio",
  "Bakery",
  "Frozen Foods",
  "Canned Goods",
  "Beverages",
  "Snacks",
  "Condiments",
  "Grains and Pasta",
  "Baking Supplies",
  "Cereal and Breakfast Foods",
  "Canned Soups and Broths",
  "Canned Vegetables and Fruits",
  "Canned Beans and Legumes",
  "Seafood",
  "International Foods",
  "Health Foods",
  "Condiments and Sauces",
  "Spices and Seasonings",
  "Oils and Vinegars",
  "Pasta Sauce",
  "Snack Bars",
  "Baby Care",
  "Personal Care",
  "Paper and Cleaning Products",
  "Pet Supplies",
]);

export type { categoriesType };
export default categories;
