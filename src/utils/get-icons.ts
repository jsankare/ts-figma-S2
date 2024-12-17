interface IconObject {
  name: string;
  icon: string;
}

export function getIcons(): IconObject[] {
  return [
    { name: "aidIcon", icon: "../../assets/category-icons/aid.svg" },
    { name: "cartIcon", icon: "../../assets/category-icons/cart.svg" },
    { name: "dryerIcon", icon: "../../assets/category-icons/dryer.svg" },
    { name: "eatIcon", icon: "../../assets/category-icons/eat.svg" },
    { name: "glassIcon", icon: "../../assets/category-icons/glass.svg" },
    { name: "heartIcon", icon: "../../assets/category-icons/heart.svg" },
    { name: "homeIcon", icon: "../../assets/category-icons/home.svg" },
    { name: "petIcon", icon: "../../assets/category-icons/pet.svg" },
    { name: "tieIcon", icon: "../../assets/category-icons/tie.svg" },
    { name: "travelIcon", icon: "../../assets/category-icons/travel.svg" },
  ];
}
