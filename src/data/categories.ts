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

const categoriesArray: categoriesType[] = [
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
];

const categories = new Set<categoriesType>(categoriesArray);

export type { categoriesType };
export { categoriesArray };
export default categories;
