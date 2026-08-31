import PropTypes from "prop-types";

export default function ColorPicker({
  value,
  onChange,
}) {
  return (
    <s-stack
      direction="inline"
      gap="small"
      align="center"
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "8px",
          backgroundColor:
            value || "#FFFFFF",
          border: "1px solid #d1d5db",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <input
          type="color"
          value={value || "#FFFFFF"}
          onChange={(event) =>
            onChange(event.target.value)
          }
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
          }}
        />
      </div>

      <s-text>
        {value || "#FFFFFF"}
      </s-text>
    </s-stack>
  );
}

ColorPicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};