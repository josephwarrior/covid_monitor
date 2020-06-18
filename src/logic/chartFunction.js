import {
  select,
  scaleLinear,
  max,
  schemeSet2,
  scaleOrdinal,
  easeLinear,
  interpolate,
  extent,
  axisTop,
  format,
  scaleTime,
  drag,
  event,
} from "d3";

export const chartFunction = (
  svg,
  dateIndex,
  isReseted,
  setDateIndex,
  setList,
  dimensions,
  barwidth,
  chartGroupWidth,
  chartGroupHeight,
  allCountries,
  transitionTime,
  removeComma,
  addComma,
  scaleMax,
  setScaleMax,
  confMargin,
  svgHeight,
  svgWidth,
  queryType,
  completeConfirmedLists,
  list
) => {
  console.log(dateIndex);

  if (isReseted) {
    setDateIndex(0);
    setList(Object.values(completeConfirmedLists)[dateIndex]);
  }

  if (!dimensions) return;

  const yScale = scaleLinear()
    .domain(extent(list, (value, index) => index)) // [0,1,2,3,4,5]
    .range([0.3 * barwidth, 0.3 * barwidth + list.length * barwidth * 1.2]);

  const calculateScaleMax = () => {
    // console.log("calculatemax");
    const instantMax = max(list, (entry) => entry[queryType]);
    let newMax = scaleMax;
    if (instantMax > 0.9 * scaleMax) {
      newMax =
        queryType.includes("atio") && instantMax * 2 > 100
          ? 100
          : instantMax * 2;
      setScaleMax(newMax);
      return newMax;
    } else if (instantMax < 0.1 * scaleMax && queryType.includes("atio")) {
      newMax = 20;
      setScaleMax(newMax);
      return newMax;
    } else if (instantMax < 0.3 * scaleMax) {
      newMax = instantMax * 1.25;
      setScaleMax(newMax);
      return newMax;
    }
    return newMax;
  };
  //console.log(scaleMax);

  const xScale = scaleLinear()
    .domain([0, calculateScaleMax()]) // [0, 65 (example)]
    .range([0, chartGroupWidth]); // [0, 400 (example)]

  const xAxis = axisTop(xScale).ticks(5);
  //console.log(list.map((value, index) => index));
  //console.log(zScale(5));
  const colorScale = scaleOrdinal()
    .domain(allCountries.map((country) => country))
    .range(schemeSet2);

  ///======================================================================

  ////=========================================================

  ////====================================================
  const chartGroup = svg
    .selectAll(".chart-group")
    .data([1])
    .join((enter) =>
      enter
        .append("g")
        .attr("class", "chart-group")
        .attr("height", chartGroupHeight)
        .attr("width", chartGroupWidth)
    )
    .attr(
      "transform",
      "translate(" + confMargin.left + "," + confMargin.top + ")"
    );

  chartGroup
    .selectAll(".x-axis")
    .data([1])
    .join(
      (enter) => enter.append("g").attr("class", "x-axis").call(xAxis),
      (update) =>
        update
          .transition()
          .duration(transitionTime)
          .ease(easeLinear)
          .call(xAxis)
      // function exit() {
      // select(this).remove();
      //}
    );

  // draw the bars
  chartGroup
    .selectAll(".bar")
    .data(list, (entry, index) => entry.country)
    .join((enter) =>
      enter.append("rect").attr("y", (entry, index) => yScale(index))
    )
    .attr("fill", (entry, index) => colorScale(entry.country))
    .attr("class", "bar")
    .attr("x", 0)
    .attr("height", barwidth)
    .attr("rx", svgHeight / 90)
    .attr("ry", svgWidth / 90)
    .transition()
    .duration(transitionTime)
    .ease(easeLinear)
    .attr("width", (entry) => {
      return xScale(entry[queryType]);
    })
    .attr("y", (entry, index) => yScale(index));

  // draw the labels
  chartGroup
    .selectAll(".label")
    .data(list, (entry, index) => entry.country)
    .join((enter) =>
      enter
        .append("text")
        .attr("y", (entry, index) => yScale(index) + barwidth - 2)
        .property(
          "_current",
          (entry) => `${entry.country} - ${format(",.0f")(entry[queryType])}`
        )
    )
    // .text((entry, index, array) => `${entry.country} - ${entry[queryType]}`)
    .attr("class", "label")
    .attr("font-size", `${0.7 * barwidth}px`)
    .transition()
    .duration(transitionTime)
    .ease(easeLinear)
    .textTween(function (entry, index) {
      const i = interpolate(
        removeComma(this._current),
        `${entry.country} - ${entry[queryType]}`
      );
      return function (t) {
        return (this._current = `${entry.country} -     ${addComma(
          i(t).split(" - ")[1]
        )}   `);
      };
    })
    //.text((entry) => `${entry.country}-${entry[queryType]}`)
    .attr("x", 10)
    .attr("y", (entry, index) => yScale(index) + 0.7 * barwidth);
};
