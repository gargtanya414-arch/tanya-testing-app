import { useEffect, useState } from "react";
import {
  useFetcher,
  useLoaderData,
} from "react-router";

import { useAppBridge } from "@shopify/app-bridge-react";

import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";

import ProductTable from "../components/ProductTable";
import SwatchEditor from "../components/SwatchEditor";

import {
  hasColorOption,
  createSwatches,
} from "../utils/swatchUtils";

/*
|--------------------------------------------------------------------------
| LOADER
|--------------------------------------------------------------------------
*/

export const loader = async ({ request }) => {
  const { admin } =
    await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query GetProducts {
        products(first: 250) {
          nodes {
            id
            title

            featuredImage {
              url
              altText
            }

            options {
              name
              values
            }

            variants(first: 100) {
              nodes {
                id
                title

                selectedOptions {
                  name
                  value
                }

                image {
                  url
                  altText
                }
              }
            }

            metafield(
              namespace: "$app"
              key: "swatch_config"
            ) {
              value
            }
          }
        }
      }
    `,
  );

  const responseJson =
    await response.json();

  const allProducts =
    responseJson.data?.products?.nodes ??
    [];

  const colorProducts =
    allProducts.filter((product) =>
      hasColorOption(product),
    );

  const configuredProducts =
    colorProducts.filter((product) =>
      Boolean(product.metafield?.value),
    );

  return {
    products: configuredProducts,
  };
};

/*
|--------------------------------------------------------------------------
| ACTION
|--------------------------------------------------------------------------
*/

export const action = async ({ request }) => {
  const { admin } =
    await authenticate.admin(request);

  const formData =
    await request.formData();

  const actionType =
    formData.get("action");

  /*
  |--------------------------------------------------------------------------
  | LOAD PRODUCTS
  |--------------------------------------------------------------------------
  */

  if (actionType === "loadProducts") {
    const productIds = JSON.parse(
      formData.get("productIds") ||
        "[]",
    );

    if (!productIds.length) {
      return {
        success: true,
        products: [],
        invalidProducts: [],
      };
    }

    const response =
      await admin.graphql(
        `#graphql
          query GetSelectedProducts(
            $ids: [ID!]!
          ) {
            nodes(ids: $ids) {

              ... on Product {

                id
                title

                featuredImage {
                  url
                  altText
                }

                options {
                  name
                  values
                }

                variants(first: 100) {
                  nodes {
                    id
                    title

                    selectedOptions {
                      name
                      value
                    }

                    image {
                      url
                      altText
                    }
                  }
                }

                metafield(
                  namespace: "$app"
                  key: "swatch_config"
                ) {
                  value
                }
              }
            }
          }
        `,
        {
          variables: {
            ids: productIds,
          },
        },
      );

    const responseJson =
      await response.json();

    const selectedProducts =
      responseJson.data?.nodes
        ?.filter(Boolean) ?? [];

    const validProducts = [];
    const invalidProducts = [];

    selectedProducts.forEach(
      (product) => {
        if (hasColorOption(product)) {
          validProducts.push(product);
        } else {
          invalidProducts.push({
            id: product.id,
            title: product.title,
          });
        }
      },
    );

    return {
      success: true,
      products: validProducts,
      invalidProducts,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  if (actionType === "save") {
    const productId =
      formData.get("productId");

    const configuration =
      JSON.parse(
        formData.get(
          "configuration",
        ) || "{}",
      );

    if (!productId) {
      return {
        success: false,
        error:
          "Product ID is missing.",
      };
    }

    const response =
      await admin.graphql(
        `#graphql
          mutation SaveSwatchConfig(
            $metafields: [MetafieldsSetInput!]!
          ) {
            metafieldsSet(
              metafields: $metafields
            ) {
              metafields {
                id
                namespace
                key
                value
              }

              userErrors {
                field
                message
                code
              }
            }
          }
        `,
        {
          variables: {
            metafields: [
              {
                ownerId: productId,
                namespace: "$app",
                key: "swatch_config",
                type: "json",
                value:
                  JSON.stringify(
                    configuration,
                  ),
              },
            ],
          },
        },
      );

    const responseJson =
      await response.json();

    const errors =
      responseJson.data
        ?.metafieldsSet
        ?.userErrors ?? [];

    if (errors.length > 0) {
      return {
        success: false,
        error: errors
          .map(
            (error) =>
              error.message,
          )
          .join(", "),
      };
    }

    return {
      success: true,
      saved: true,
      productId,
      configuration,
    };
  }

  return {
    success: false,
    error: "Invalid action.",
  };
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function Index() {
  const loaderData =
    useLoaderData();

  const shopify =
    useAppBridge();

  /*
  |--------------------------------------------------------------------------
  | FETCHERS
  |--------------------------------------------------------------------------
  */

  const productFetcher =
    useFetcher();

  const saveFetcher =
    useFetcher();

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [products, setProducts] =
    useState(
      loaderData?.products ?? [],
    );

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState(null);

  const [swatches, setSwatches] =
    useState([]);

  const [
    pickerMessage,
    setPickerMessage,
  ] = useState("");

  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOADER DATA
  |--------------------------------------------------------------------------
  */

  // useEffect(() => {
  //   if (loaderData?.products) {
  //     setProducts(
  //       loaderData.products,
  //     );
  //   }
  // }, [loaderData]);

  /*
  |--------------------------------------------------------------------------
  | PRODUCT PICKER
  |--------------------------------------------------------------------------
  */

  async function openProductPicker() {
    setPickerMessage("");

    const selection =
      await shopify.resourcePicker({
        type: "product",
        multiple: true,
        action: "select",
      });

    if (
      !selection ||
      selection.length === 0
    ) {
      return;
    }

    const productIds =
      selection.map(
        (product) => product.id,
      );

    const formData =
      new FormData();

    formData.append(
      "action",
      "loadProducts",
    );

    formData.append(
      "productIds",
      JSON.stringify(
        productIds,
      ),
    );

    productFetcher.submit(
      formData,
      {
        method: "POST",
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PRODUCT PICKER RESPONSE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !productFetcher.data
        ?.success
    ) {
      return;
    }

    if (
      productFetcher.data.products
    ) {
      setProducts(
        (previousProducts) => {
          const productMap =
            new Map();

          previousProducts.forEach(
            (product) => {
              productMap.set(
                product.id,
                product,
              );
            },
          );

          productFetcher.data.products.forEach(
            (product) => {
              productMap.set(
                product.id,
                product,
              );
            },
          );

          return Array.from(
            productMap.values(),
          );
        },
      );
    }

    if (
      productFetcher.data
        .invalidProducts
        ?.length
    ) {
      const names =
        productFetcher.data
          .invalidProducts
          .map(
            (product) =>
              product.title,
          )
          .join(", ");

      setPickerMessage(
        `These products were not added because they do not have a Color or Colour variant: ${names}`,
      );
    } else {
      setPickerMessage("");
    }
  }, [
    productFetcher.data,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SELECT PRODUCT
  |--------------------------------------------------------------------------
  */

  function selectProduct(product) {
    /*
     * Clear previous product
     */

    setSelectedProductId(null);
    setSwatches([]);
    setSaveMessage("");

    /*
     * Select new product
     */

    setSelectedProductId(
      product.id,
    );

    /*
     * Generate swatches
     */

    const newSwatches =
      createSwatches(product);

    setSwatches(
      newSwatches,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CHANGE TYPE
  |--------------------------------------------------------------------------
  */

  function changeSwatchType(
    index,
    type,
  ) {
    setSwatches(
      (previous) => {
        const updated = [
          ...previous,
        ];

        updated[index] = {
          ...updated[index],
          type,
        };

        return updated;
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CHANGE COLOR
  |--------------------------------------------------------------------------
  */

  function changeColor(
    index,
    value,
  ) {
    setSwatches(
      (previous) => {
        const updated = [
          ...previous,
        ];

        updated[index] = {
          ...updated[index],
          value,
        };

        return updated;
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  function saveProduct() {
    if (
      !selectedProductId
    ) {
      return;
    }

    const configuration = {
      enabled: true,

      swatches,

      updatedAt:
        new Date().toISOString(),
    };

    const formData =
      new FormData();

    formData.append(
      "action",
      "save",
    );

    formData.append(
      "productId",
      selectedProductId,
    );

    formData.append(
      "configuration",
      JSON.stringify(
        configuration,
      ),
    );

    saveFetcher.submit(
      formData,
      {
        method: "POST",
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE RESPONSE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !saveFetcher.data?.saved
    ) {
      return;
    }

    setSaveMessage(
      "Changes saved successfully.",
    );

    setProducts(
      (previousProducts) =>
        previousProducts.map(
          (product) => {
            if (
              product.id !==
              saveFetcher.data
                .productId
            ) {
              return product;
            }

            return {
              ...product,

              metafield: {
                value:
                  JSON.stringify(
                    saveFetcher
                      .data
                      .configuration,
                  ),
              },
            };
          },
        ),
    );
  }, [
    saveFetcher.data,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CURRENT PRODUCT
  |--------------------------------------------------------------------------
  */

  const selectedProduct =
    products.find(
      (product) =>
        product.id ===
        selectedProductId,
    );

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <s-page
      heading="Product Swatches"
    >

      {/* SELECT PRODUCTS */}

      <s-button
        slot="primary-action"
        variant="primary"
        onClick={
          openProductPicker
        }
        loading={
          productFetcher.state ===
          "submitting"
        }
      >
        Select products
      </s-button>

      {/* PRODUCTS */}

      <s-section
        heading="Products"
      >

        {pickerMessage && (
          <s-banner tone="warning">
            {pickerMessage}
          </s-banner>
        )}

        <ProductTable
          products={products}
          onConfigure={
            selectProduct
          }
        />

      </s-section>

      {/* CONFIGURATION */}

      {selectedProduct && (
        <SwatchEditor
          key={
            selectedProduct.id
          }
          product={
            selectedProduct
          }
          swatches={swatches}
          onTypeChange={
            changeSwatchType
          }
          onColorChange={
            changeColor
          }
          onSave={
            saveProduct
          }
          saving={
            saveFetcher.state ===
            "submitting"
          }
          saveMessage={
            saveMessage
          }
        />
      )}

    </s-page>
  );
}

/*
|--------------------------------------------------------------------------
| HEADERS
|--------------------------------------------------------------------------
*/

export const headers = (
  headersArgs,
) => {
  return boundary.headers(
    headersArgs,
  );
};