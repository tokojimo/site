const STAR_PATH =
  "M12 2.248l2.92 5.912 6.528.948-4.724 4.604 1.116 6.508L12 17.9l-5.84 3.12 1.116-6.508-4.724-4.604 6.528-.948z";

function createStarSvg(fillRatio) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("aria-hidden", "true");

  const star = document.createElementNS("http://www.w3.org/2000/svg", "path");
  star.setAttribute("d", STAR_PATH);
  star.setAttribute("stroke-width", "1.5");
  star.setAttribute("stroke-linejoin", "round");
  star.setAttribute("stroke", "var(--color-primary)");
  star.setAttribute("fill", "none");

  if (fillRatio >= 1) {
    star.setAttribute("fill", "var(--color-primary)");
  } else if (fillRatio > 0) {
    const gradientId = `spot-star-${Math.random().toString(36).slice(2)}`;
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const linear = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient",
    );
    linear.setAttribute("id", gradientId);
    linear.setAttribute("x1", "0%");
    linear.setAttribute("x2", "100%");
    linear.setAttribute("y1", "0%");
    linear.setAttribute("y2", "0%");

    const stopFilled = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop",
    );
    stopFilled.setAttribute("offset", `${fillRatio * 100}%`);
    stopFilled.setAttribute("stop-color", "var(--color-primary)");

    const stopEmpty = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop",
    );
    stopEmpty.setAttribute("offset", `${fillRatio * 100}%`);
    stopEmpty.setAttribute("stop-color", "transparent");

    const stopEmptyEnd = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop",
    );
    stopEmptyEnd.setAttribute("offset", "100%");
    stopEmptyEnd.setAttribute("stop-color", "transparent");

    linear.append(stopFilled, stopEmpty, stopEmptyEnd);
    defs.append(linear);
    svg.appendChild(defs);
    star.setAttribute("fill", `url(#${gradientId})`);
  }

  svg.appendChild(star);
  return svg;
}

export function createRatingDisplay(value, { max = 5, size = "default" } = {}) {
  const safeValue = Math.max(0, Math.min(value ?? 0, max));
  const wrapper = document.createElement("div");
  wrapper.className = "spot-rating-display";
  wrapper.setAttribute("role", "img");
  wrapper.setAttribute(
    "aria-label",
    `Note : ${safeValue.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} sur ${max}`,
  );

  for (let index = 0; index < max; index += 1) {
    const ratio = Math.max(0, Math.min(1, safeValue - index));
    const svg = createStarSvg(ratio);
    if (size === "compact") {
      svg.style.width = "0.9rem";
      svg.style.height = "0.9rem";
    }
    wrapper.appendChild(svg);
  }

  return wrapper;
}

export function createRatingInput({
  name,
  value = 0,
  max = 5,
  legend = "Note",
  description,
  onChange,
}) {
  const fieldset = document.createElement("fieldset");
  fieldset.className = "spot-note__group";

  const legendElement = document.createElement("legend");
  legendElement.textContent = legend;
  fieldset.appendChild(legendElement);

  const descriptionId = description
    ? `spot-note-desc-${Math.random().toString(36).slice(2)}`
    : undefined;

  if (description) {
    const desc = document.createElement("p");
    desc.id = descriptionId;
    desc.className = "spot-note__description";
    desc.textContent = description;
    fieldset.appendChild(desc);
  }

  const ratingContainer = document.createElement("div");
  ratingContainer.className = "spot-rating-input";
  ratingContainer.setAttribute("role", "radiogroup");
  ratingContainer.setAttribute("aria-label", legend);
  if (descriptionId) {
    ratingContainer.setAttribute("aria-describedby", descriptionId);
  }

  const tooltip = document.createElement("div");
  tooltip.className = "spot-rating-tooltip";
  tooltip.setAttribute("aria-hidden", "true");
  tooltip.textContent = `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}/${max}`;

  let currentValue = value;

  const updateTooltip = (newValue) => {
    tooltip.textContent = `${newValue.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}/${max}`;
  };

  const handleChange = (newValue) => {
    currentValue = newValue;
    updateTooltip(currentValue);
    if (typeof onChange === "function") {
      onChange(currentValue);
    }
  };

  for (let index = 1; index <= max; index += 1) {
    const id = `${name}-${index}`;
    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.id = id;
    input.value = String(index);
    if (index === Math.round(value)) {
      input.checked = true;
    }

    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.appendChild(createStarSvg(index <= value ? 1 : 0));

    input.addEventListener("change", () => {
      handleChange(index);
      ratingContainer
        .querySelectorAll("label svg")
        .forEach((svgElement, idx) => {
          const fillRatio = idx + 1 <= index ? 1 : 0;
          const newSvg = createStarSvg(fillRatio);
          svgElement.replaceWith(newSvg);
        });
    });

    label.addEventListener("mouseenter", () => updateTooltip(index));
    label.addEventListener("focus", () => updateTooltip(index));
    label.addEventListener("mouseleave", () => updateTooltip(currentValue));
    label.addEventListener("blur", () => updateTooltip(currentValue));

    ratingContainer.append(input, label);
  }

  fieldset.append(ratingContainer, tooltip);
  return { element: fieldset, getValue: () => currentValue };
}
