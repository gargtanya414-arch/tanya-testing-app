import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";

export default function SwatchRow({
  swatch,
  index,
  onTypeChange,
  onColorChange,
}) {
  return (
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

        {/* COLOR NAME */}

        <s-stack
          direction="block"
          gap="small"
        >
          <s-text>
            Color
          </s-text>

          <s-heading>
            {swatch.name}
          </s-heading>
        </s-stack>

        {/* SWATCH TYPE */}

        <s-select
          label="Swatch type"
          value={swatch.type}
          onChange={(event) =>
            onTypeChange(
              index,
              event.target.value,
            )
          }
        >
          <s-option value="color">
            Color
          </s-option>

          <s-option value="image">
            Image
          </s-option>
        </s-select>

        {/* COLOR */}

        {swatch.type === "color" && (
          <ColorPicker
            value={swatch.value}
            onChange={(value) =>
              onColorChange(
                index,
                value,
              )
            }
          />
        )}

        {/* IMAGE */}

        {swatch.type === "image" && (
          <s-stack
            direction="inline"
            gap="small"
            align="center"
          >
            {swatch.image ? (
              <s-thumbnail
                src={swatch.image}
                alt={swatch.name}
              />
            ) : (
              <s-text>
                No image selected
              </s-text>
            )}

            <s-button>
              Select image
            </s-button>
          </s-stack>
        )}

      </s-stack>
    </s-box>
  );
}

SwatchRow.propTypes = {
  swatch: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  onColorChange: PropTypes.func.isRequired,
};