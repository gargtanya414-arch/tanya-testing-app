import PropTypes from "prop-types";
import { getColorOption } from "../utils/swatchUtils";

export default function ProductTable({
  products,
  onConfigure,
}) {
  if (products.length === 0) {
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
            No products selected
          </s-heading>

          <s-paragraph>
            Click Select products to choose
            products from your Shopify store.
          </s-paragraph>
        </s-stack>
      </s-box>
    );
  }

  return (
    <s-table>

      <s-table-header-row>

        <s-table-header>
          Product
        </s-table-header>

        <s-table-header>
          Color variants
        </s-table-header>

        <s-table-header>
          Status
        </s-table-header>

        <s-table-header>
          Action
        </s-table-header>

      </s-table-header-row>

      <s-table-body>

        {products.map((product) => {

          const colorOption =
            getColorOption(product);

          const isConfigured =
            Boolean(
              product.metafield?.value,
            );

          return (
            <s-table-row
              key={product.id}
            >

              {/* PRODUCT */}

              <s-table-cell>
                <s-stack
                  direction="inline"
                  gap="base"
                  align="center"
                >

                  {product.featuredImage?.url ? (
                    <s-thumbnail
                      src={
                        product.featuredImage
                          .url
                      }
                      alt={
                        product.featuredImage
                          .altText ||
                        product.title
                      }
                    />
                  ) : (
                    <s-text>
                      No image
                    </s-text>
                  )}

                  <s-text>
                    {product.title}
                  </s-text>

                </s-stack>
              </s-table-cell>

              {/* COLORS */}

              <s-table-cell>
                {colorOption ? (
                  <s-stack
                    direction="inline"
                    gap="small"
                  >
                    {colorOption.values.map(
                      (color) => (
                        <s-badge
                          key={color}
                        >
                          {color}
                        </s-badge>
                      ),
                    )}
                  </s-stack>
                ) : (
                  <s-text>
                    No Color variant
                  </s-text>
                )}
              </s-table-cell>

              {/* STATUS */}

              <s-table-cell>
                {isConfigured ? (
                  <s-badge tone="success">
                    Configured
                  </s-badge>
                ) : (
                  <s-badge tone="caution">
                    Not configured
                  </s-badge>
                )}
              </s-table-cell>

              {/* ACTION */}

              <s-table-cell>
                <s-button
                  onClick={() =>
                    onConfigure(product)
                  }
                >
                  Configure
                </s-button>
              </s-table-cell>

            </s-table-row>
          );
        })}

      </s-table-body>

    </s-table>
  );
}

ProductTable.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      featuredImage: PropTypes.shape({
        url: PropTypes.string,
        altText: PropTypes.string,
      }),
      metafield: PropTypes.shape({
        value: PropTypes.string,
      }),
    }),
  ).isRequired,
  onConfigure: PropTypes.func.isRequired,
};