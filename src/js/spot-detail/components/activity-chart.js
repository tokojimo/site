const SVG_NS = "http://www.w3.org/2000/svg";

function formatDateLabel(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(new Date(date));
}

export function createActivityChartSection(series, formatNumber) {
  const section = document.createElement("section");
  section.className = "spot-section spot-section--chart";
  section.setAttribute("aria-labelledby", "spot-activity-chart");

  const heading = document.createElement("h2");
  heading.id = "spot-activity-chart";
  heading.textContent = "Cueillettes par jour (dernières 2 semaines)";

  const chartContainer = document.createElement("div");
  chartContainer.className = "spot-chart";

  const tooltip = document.createElement("div");
  tooltip.className = "spot-chart__tooltip";
  chartContainer.appendChild(tooltip);

  const width = 640;
  const height = 280;
  const margin = { top: 24, right: 20, bottom: 48, left: 48 };

  const maxQuantity = Math.max(...series.map((item) => item.quantity), 1);
  const pointCount = series.length;
  const stepX =
    (width - margin.left - margin.right) / Math.max(pointCount - 1, 1);

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const title = document.createElementNS(SVG_NS, "title");
  const titleId = `spot-chart-title-${Math.random().toString(36).slice(2)}`;
  title.id = titleId;
  title.textContent = heading.textContent;
  svg.appendChild(title);

  const summaryData = (() => {
    const first = series[0];
    const last = series[series.length - 1];
    const maxEntry = series.reduce(
      (acc, item) => (item.quantity > acc.quantity ? item : acc),
      series[0],
    );
    const delta = last.quantity - first.quantity;
    let trend = "Activité stable.";
    if (delta > 0.2) {
      trend = "Activité en hausse sur la période analysée.";
    } else if (delta < -0.2) {
      trend = "Activité en baisse sur la période analysée.";
    }
    return {
      trend,
      maxEntry,
    };
  })();

  const desc = document.createElementNS(SVG_NS, "desc");
  const descId = `spot-chart-desc-${Math.random().toString(36).slice(2)}`;
  desc.id = descId;
  desc.textContent = `${summaryData.trend} Pic observé le ${formatLongDate(summaryData.maxEntry.date)} avec ${formatNumber(
    summaryData.maxEntry.quantity,
  )} kg.`;
  svg.appendChild(desc);

  const srSummary = document.createElement("p");
  const summaryId = `spot-chart-summary-${Math.random().toString(36).slice(2)}`;
  srSummary.id = summaryId;
  srSummary.className = "spot-sr-only";
  srSummary.textContent = desc.textContent;

  svg.setAttribute("role", "img");
  svg.setAttribute("aria-labelledby", `${titleId} ${descId}`);
  svg.setAttribute("aria-describedby", summaryId);

  const axisGroup = document.createElementNS(SVG_NS, "g");
  axisGroup.setAttribute("fill", "none");
  axisGroup.setAttribute("stroke", "#d9dde6");
  axisGroup.setAttribute("stroke-width", "1");

  const xAxis = document.createElementNS(SVG_NS, "line");
  xAxis.setAttribute("x1", margin.left);
  xAxis.setAttribute("x2", width - margin.right);
  xAxis.setAttribute("y1", height - margin.bottom);
  xAxis.setAttribute("y2", height - margin.bottom);
  axisGroup.appendChild(xAxis);

  const yAxis = document.createElementNS(SVG_NS, "line");
  yAxis.setAttribute("x1", margin.left);
  yAxis.setAttribute("x2", margin.left);
  yAxis.setAttribute("y1", margin.top);
  yAxis.setAttribute("y2", height - margin.bottom);
  axisGroup.appendChild(yAxis);

  svg.appendChild(axisGroup);

  const labelsGroup = document.createElementNS(SVG_NS, "g");

  series.forEach((item, index) => {
    const x = margin.left + index * stepX;
    if (index === 0 || index === series.length - 1 || index % 3 === 0) {
      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", x);
      label.setAttribute("y", height - margin.bottom + 24);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "#2b3240");
      label.setAttribute("font-size", "12");
      label.textContent = formatDateLabel(item.date);
      labelsGroup.appendChild(label);
    }
  });

  for (let y = 0; y <= 4; y += 1) {
    const value = (maxQuantity / 4) * y;
    const yPos =
      height -
      margin.bottom -
      (value / maxQuantity) * (height - margin.top - margin.bottom);
    const gridLine = document.createElementNS(SVG_NS, "line");
    gridLine.setAttribute("x1", margin.left);
    gridLine.setAttribute("x2", width - margin.right);
    gridLine.setAttribute("y1", yPos);
    gridLine.setAttribute("y2", yPos);
    gridLine.setAttribute("stroke", "rgba(152, 162, 179, 0.3)");
    gridLine.setAttribute("stroke-dasharray", "4 4");
    svg.appendChild(gridLine);

    const valueLabel = document.createElementNS(SVG_NS, "text");
    valueLabel.setAttribute("x", margin.left - 12);
    valueLabel.setAttribute("y", yPos + 4);
    valueLabel.setAttribute("text-anchor", "end");
    valueLabel.setAttribute("fill", "#2b3240");
    valueLabel.setAttribute("font-size", "12");
    valueLabel.textContent = formatNumber(value);
    labelsGroup.appendChild(valueLabel);
  }

  svg.appendChild(labelsGroup);

  const linePath = document.createElementNS(SVG_NS, "path");
  const pathD = series
    .map((item, index) => {
      const x = margin.left + index * stepX;
      const y =
        height -
        margin.bottom -
        (item.quantity / maxQuantity) * (height - margin.top - margin.bottom);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  linePath.setAttribute("d", pathD);
  linePath.setAttribute("fill", "none");
  linePath.setAttribute("stroke", "var(--color-primary)");
  linePath.setAttribute("stroke-width", "2");
  linePath.setAttribute("stroke-linecap", "round");
  svg.appendChild(linePath);

  const pointGroup = document.createElementNS(SVG_NS, "g");

  const handleFocus = (event) => {
    const target = event.target;
    const index = Number.parseInt(target.getAttribute("data-index"), 10);
    const item = series[index];
    if (!item) {
      return;
    }
    const rect = chartContainer.getBoundingClientRect();
    tooltip.setAttribute("data-visible", "true");
    tooltip.textContent = `${formatLongDate(item.date)} · ${formatNumber(item.quantity)} kg`;
    tooltip.style.left = `${target.getBoundingClientRect().left - rect.left}px`;
    tooltip.style.top = `${target.getBoundingClientRect().top - rect.top - 12}px`;
  };

  const hideTooltip = () => {
    tooltip.removeAttribute("data-visible");
  };

  const focusPoint = (currentIndex, delta) => {
    const nextIndex = currentIndex + delta;
    const nextCircle = pointGroup.querySelector(
      `circle[data-index="${nextIndex}"]`,
    );
    if (nextCircle) {
      nextCircle.focus();
    }
  };

  series.forEach((item, index) => {
    const x = margin.left + index * stepX;
    const y =
      height -
      margin.bottom -
      (item.quantity / maxQuantity) * (height - margin.top - margin.bottom);
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", "5");
    circle.setAttribute("fill", "#ffffff");
    circle.setAttribute("stroke", "var(--color-primary)");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("tabindex", "0");
    circle.setAttribute("data-index", String(index));
    circle.setAttribute(
      "aria-label",
      `${formatLongDate(item.date)} : ${formatNumber(item.quantity)} kilogrammes récoltés`,
    );

    circle.addEventListener("focus", handleFocus);
    circle.addEventListener("mouseenter", handleFocus);
    circle.addEventListener("blur", hideTooltip);
    circle.addEventListener("mouseleave", hideTooltip);
    circle.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusPoint(index, -1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        focusPoint(index, 1);
      }
    });

    pointGroup.appendChild(circle);
  });

  svg.appendChild(pointGroup);

  chartContainer.appendChild(svg);
  chartContainer.appendChild(srSummary);

  section.append(heading, chartContainer);
  return section;
}
