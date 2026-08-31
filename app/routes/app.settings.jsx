import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Settings() {
  return (
    <s-page heading="Settings">
      <s-section heading="App Settings">
        <s-paragraph>
          Yahan aap apni app ki settings manage karoge.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}