export function hasColorOption(product) {
  return product.options?.some((option) => {
    const name = option.name?.toLowerCase().trim();

    return name === "color" || name === "colour";
  });
}

export function getColorOption(product) {
  return product.options?.find((option) => {
    const name = option.name?.toLowerCase().trim();

    return name === "color" || name === "colour";
  });
}

export function getSavedConfiguration(product) {
  if (!product.metafield?.value) {
    return null;
  }

  try {
    return JSON.parse(product.metafield.value);
  } catch {
    return null;
  }
}

export function createSwatches(product) {
  const colorOption = getColorOption(product);

  if (!colorOption) {
    return [];
  }

  const savedConfiguration =
    getSavedConfiguration(product);

  return colorOption.values.map((colorName) => {
    const savedSwatch =
      savedConfiguration?.swatches?.find(
        (item) => item.name === colorName,
      );

    const variant =
      product.variants?.nodes?.find((variant) => {
        return variant.selectedOptions?.some(
          (option) => {
            const optionName =
              option.name?.toLowerCase().trim();

            return (
              (optionName === "color" ||
                optionName === "colour") &&
              option.value === colorName
            );
          },
        );
      });

    return {
      name: colorName,

      type: savedSwatch?.type || "color",

      value:
        savedSwatch?.value || "#FFFFFF",

      image:
        savedSwatch?.image ||
        variant?.image?.url ||
        null,

      variantId:
        variant?.id || null,
    };
  });
}