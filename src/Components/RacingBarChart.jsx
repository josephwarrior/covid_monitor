import React, { useRef, useEffect, useState } from "react";
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
} from "d3";
import useResizeObserver from "../logic/useResizeObserver";

const RacingBarChart = ({
  list,
  allCountries,
  queryType,
  transitionTime,
  isReseted,
  chartTitle,
  dateIndex,
}) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  const [scaleMax, setScaleMax] = useState(0);

  // will be called initially and on every data change
  useEffect(() => {
    //console.log(list);
    const svgWidth = 300;
    const svgHeight = 300;
    const barwidth = (15 / 185) * svgHeight;
    const margin = { top: 20, right: 20, bottom: 0, left: 10 };
    const chartGroupWidth = svgWidth - margin.left - margin.right;
    const chartGroupHeight = svgHeight - margin.top - margin.bottom;

    const svg = select(svgRef.current)
      .attr("width", svgWidth)
      .attr("height", svgHeight);
    if (!dimensions) return;

    const yScale = scaleLinear()
      .domain(extent(list, (value, index) => index)) // [0,1,2,3,4,5]
      .range([0, (list.length * svgHeight) / 10.7]);

    const calculateScaleMax = () => {
      // console.log("calculatemax");
      const instantMax = max(list, (entry) => entry[queryType]);
      // console.log(instantMax);
      if (instantMax < scaleMax / 1.1 && !isReseted) {
        return scaleMax;
      } else {
        const newMax =
          queryType.includes("atio") && instantMax * 2 > 100
            ? 100
            : instantMax * 2;
        setScaleMax(newMax);
        return newMax;
      }
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
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
      .attr("rx", svgHeight / 30)
      .attr("ry", svgWidth / 30)
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
      .attr("font-size", `${(10 / 185) * svgHeight}px`)
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
  }, [list, dimensions, dateIndex]);

  const addComma = (numberString) => {
    return format(",.0f")(numberString);
  };

  const removeComma = (numberString) => {
    return numberString.replace(/,/g, "");
  };

  return (
    <div ref={wrapperRef} style={{ marginBottom: "2rem" }}>
      <h3>{chartTitle}</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RacingBarChart;
