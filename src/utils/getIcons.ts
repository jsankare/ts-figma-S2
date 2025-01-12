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

export function getCategoryIcons(): void {
  const icons = getIcons();
  const iconsContainer = document.getElementById("iconsContainer");

  if (!iconsContainer) {
    console.error("Icons container not found");
    return;
  }

  iconsContainer.innerHTML = "";

  icons.forEach((icon) => {
    const imgwrapper = document.createElement("div");
    const img = document.createElement("img");

    imgwrapper.className = "wrapper-icon";
    img.src = icon.icon; // Set the icon source
    img.alt = icon.name; // Set the alt text for accessibility
    img.title = icon.name; // Set the title text
    img.className = "category-icon";
    imgwrapper.appendChild(img);

    // Optional: Add a click handler to select an icon
    img.addEventListener("click", () => {
      const iconPreview = document.getElementById("iconPreview") as HTMLImageElement;
      if (iconPreview) {
        // Remove previously selected icon class
        const previouslySelected = iconsContainer.querySelector(".selected");
        if (previouslySelected) {
          previouslySelected.classList.remove("selected");
        }

        // Add the selected class to the clicked icon wrapper
        imgwrapper.classList.add("selected");

        // Set the preview image to the selected icon
        iconPreview.src = icon.icon;
      }
    });

    iconsContainer.appendChild(imgwrapper);
  });
}
