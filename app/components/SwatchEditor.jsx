import PropTypes from "prop-types";
import SwatchRow from "./SwatchRow";
import { getColorOption } from "../utils/swatchUtils";

export default function SwatchEditor({
  product,
  swatches,
  onTypeChange,
  onColorChange,
  onSave,
  saving,
  saveMessage,
}) {
  const colorOption =
    getColorOption(product);

  if (!colorOption) {
    return (
      <s-box
        padding="large"
        borderWidth="base"
        borderRadius="base"
      >
        <s-stack
          direction="block"
          gap="base"
        >
          <s-heading>
            Color variant not found
          </s-heading>

          <s-paragraph>
            This product does not have a
            Color or Colour variant.
          </s-paragraph>
        </s-stack>
      </s-box>
    );
  }

  return (
    <s-section
      key={product.id}
      heading={`Configure: ${product.title}`}
    >

      {/* PRODUCT INFO */}

      <s-box
        padding="base"
        borderWidth="base"
        borderRadius="base"
      >
        <s-stack
          direction="inline"
          gap="base"
          align="center"
        >

          {product.featuredImage?.url && (
            <s-thumbnail
              src={
                product.featuredImage.url
              }
              alt={
                product.featuredImage
                  .altText ||
                product.title
              }
            />
          )}

          <s-stack
            direction="block"
            gap="small"
          >
            <s-heading>
              {product.title}
            </s-heading>

            <s-paragraph>
              Configure Color or Image
              swatches for this product.
            </s-paragraph>
          </s-stack>

        </s-stack>
      </s-box>

      {/* COLOR VARIANTS */}

      <s-box
        padding="base"
        borderWidth="base"
        borderRadius="base"
      >
        <s-stack
          direction="block"
          gap="base"
        >

          <s-heading>
            Color Variants
          </s-heading>

          <s-paragraph>
            Choose whether each color should
            use a color swatch or an image
            swatch.
          </s-paragraph>

          {/* SWATCH ROWS */}

          {swatches.map(
            (swatch, index) => (
              <SwatchRow
                key={swatch.name}
                swatch={swatch}
                index={index}
                onTypeChange={
                  onTypeChange
                }
                onColorChange={
                  onColorChange
                }
              />
            ),
          )}

          {/* SAVE */}

          <s-stack
            direction="block"
            gap="base"
          >
            <s-button
              variant="primary"
              onClick={onSave}
              loading={saving}
            >
              Save changes
            </s-button>

            {saveMessage && (
              <s-banner tone="success">
                {saveMessage}
              </s-banner>
            )}
          </s-stack>

        </s-stack>
      </s-box>

    </s-section>
  );
}

SwatchEditor.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    featuredImage: PropTypes.shape({
      url: PropTypes.string,
      altText: PropTypes.string,
    }),
  }).isRequired,
  swatches: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      color: PropTypes.string,
      image: PropTypes.string,
    }),
  ).isRequired,
  onTypeChange: PropTypes.func.isRequired,
  onColorChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  saveMessage: PropTypes.string,
};