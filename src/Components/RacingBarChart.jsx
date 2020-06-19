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

const RacingBarChart = ({
  allCountries,
  queryType,
  transitionTime,
  isReseted,
  chartTitle,
  completeLists,
  start,
  dateIndex,
  setDateIndex,
}) => {
  const [list, setList] = useState(Object.values(completeLists)[0]);
  let [intervalId, setIntervalId] = useState(0);

  const svgRef = useRef();

  const [scaleMax, setScaleMax] = useState(0);

  const updateList = () => {
    if (dateIndex === Object.values(completeLists).length - 1) {
      clearInterval(intervalId);
      return;
    }
    setList(Object.values(completeLists)[dateIndex]);

    dateIndex = dateIndex + 1;
    setDateIndex(dateIndex);
  };

  useEffect(() => {
    if (start && intervalId === 0) {
      intervalId = setInterval(() => updateList(), transitionTime);
      setIntervalId(intervalId);
    } else {
      intervalId !== 0 && clearInterval(intervalId);
      intervalId = 0;
      setIntervalId(0);
    }
  }, [start]);

  const browserWidth =
    1 * window.innerWidth ||
    1 * document.documentElement.clientWidth ||
    1 * document.getElementsByTagName("body")[0].clientWidth;
  const svgWidth = browserWidth <= 768 ? browserWidth : browserWidth / 3;
  const svgHeight =
    1 * window.innerHeight ||
    1 * document.documentElement.clientHeight ||
    1 * document.getElementsByTagName("body")[0].clientHeight;
  const controlWidth = svgWidth * 0.95;
  const controlBarWidth = (1 / 185) * svgHeight;
  const barwidth = (6 / 185) * svgHeight;
  const confMargin = { top: 30, right: 40, bottom: 0, left: 40 };
  const chartGroupWidth = svgWidth - confMargin.left - confMargin.right;
  const chartGroupHeight = svgHeight - confMargin.top - confMargin.bottom;
  const sliderWidth = (2 / 50) * svgWidth;
  const sliderHeight = controlBarWidth * 12;
  const svg = select(svgRef.current)
    .attr("width", svgWidth)
    .attr("height", barwidth * 14.3);

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

  useEffect(() => {
    if (isReseted) {
      setDateIndex(0);
    }
    setList(Object.values(completeLists)[dateIndex]);

    const yScale = scaleLinear()
      .domain(extent(list, (value, index) => index))
      .range([0.3 * barwidth, 0.3 * barwidth + list.length * barwidth * 1.2]);

    const calculateScaleMax = () => {
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

    const xScale = scaleLinear()
      .domain([0, calculateScaleMax()])
      .range([0, chartGroupWidth]);
    const xAxis = axisTop(xScale).ticks(5);
    const colorScale = scaleOrdinal()
      .domain(allCountries.map((country) => country))
      .range(schemeSet2);

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
      );

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
      .attr("x", 10)
      .attr("y", (entry, index) => yScale(index) + 0.7 * barwidth);
  }, [start, isReseted, list, dateIndex, svg]);

  const addComma = (numberString) => {
    return format(",.0f")(numberString);
  };

  const removeComma = (numberString) => {
    return numberString.replace(/,/g, "");
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3>{chartTitle}</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RacingBarChart;
