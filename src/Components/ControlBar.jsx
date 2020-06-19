import React, { useRef, useEffect, useState } from "react";
import { select, easeLinear, axisTop, scaleTime, drag, event } from "d3";

import {
  convertStringToDate,
  convertDateToString,
} from "../logic/utilFunctions";

const ControlBar = ({
  datesArray,
  dateIndex,
  transitionTime,
  setStart,
  setDateIndex,
  setIsReseted,
}) => {
  const svgRef = useRef();

  const wrapperRef = useRef();

  const [scaleMax, setScaleMax] = useState(0);

  useEffect(() => {
    let svgWidth =
      1 * window.innerWidth ||
      1 * document.documentElement.clientWidth ||
      1 * document.getElementsByTagName("body")[0].clientWidth;

    const svgHeight =
      0.07 * window.innerHeight ||
      0.07 * document.documentElement.clientHeight ||
      0.07 * document.getElementsByTagName("body")[0].clientHeight;
    const controlWidth = svgWidth * 0.95;
    const controlHeight = (6 / 185) * svgHeight;
    const barWidth = (25 / 185) * svgHeight;
    const margin = { top: 20, right: 40, bottom: 20, left: 40 };
    const controlGroupWidth = svgWidth - margin.left - margin.right;
    const controlGroupHeight = svgHeight - margin.top - margin.bottom;
    const sliderWidth = (2 / 50) * svgWidth;
    const sliderHeight = controlHeight * 20;
    const svg = select(svgRef.current)
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    let minDate = convertStringToDate(datesArray[0]);
    let maxDate = convertStringToDate(datesArray[datesArray.length - 1]);

    let xScale = scaleTime()
      .domain([minDate, maxDate])
      .range([0, controlGroupWidth]);

    let xAxis = axisTop(xScale).ticks(5);

    const controlBarGroup = svg
      .selectAll(".controlbar-group")
      .data([1])
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "controlbar-group")
          .attr("height", controlGroupHeight)
          .attr("width", controlGroupWidth)
      )
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    controlBarGroup
      .selectAll(".across-bar")
      .data([dateIndex])
      .join((enter) => enter.append("rect").attr("class", "across-bar"))
      .attr("x", 0)
      .attr("y", -barWidth)
      .attr("width", controlGroupWidth)
      .attr("height", barWidth)
      .attr("fill", "gray");

    controlBarGroup
      .selectAll(".date-axis")
      .data([1])
      .join(
        (enter) => enter.append("g").attr("class", "date-axis").call(xAxis),
        (update) => update.call(xAxis)
      );

    const slider = controlBarGroup
      .selectAll(".slider")
      .data([dateIndex])
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "slider")
            .attr("x", (entry) => {
              return (
                xScale(convertStringToDate(datesArray[entry])) - sliderWidth / 2
              );
            }),
        (update) =>
          update
            .transition()
            .duration(transitionTime)
            .ease(easeLinear)
            .attr("x", (entry) => {
              return (
                xScale(convertStringToDate(datesArray[entry])) - sliderWidth / 2
              );
            })
      )
      .attr("y", -(barWidth + (sliderHeight - barWidth) / 2))
      .attr("width", sliderWidth)
      .attr("height", sliderHeight)
      .attr("fill", "gray")
      .attr("stroke-width", "10em")
      .attr("rx", "1em")
      .attr("ry", "1em")
      .attr("opacity", 0.8);

    slider.call(
      drag()
        .on("start", () => {
          setIsReseted(false);
          let [dateString, newDateIndex] = positionSlider();
          dateIndex = newDateIndex;
          setDateIndex(newDateIndex);
          setStart(false);
        })
        .on("drag", () => {
          let [dateString, newDateIndex] = positionSlider();
          dateIndex = newDateIndex;
          setDateIndex(newDateIndex);
        })
        .on("end", () => {
          let [dateString, newDateIndex] = positionSlider();
          dateIndex = newDateIndex;
          setDateIndex(newDateIndex);
        })
    );
    const positionSlider = () => {
      let sliderCenterX = event.x < 0 ? 0 : event.x;
      sliderCenterX =
        sliderCenterX > controlWidth ? controlWidth : sliderCenterX;
      slider
        .transition()
        .duration(20)
        .attr("x", sliderCenterX - sliderWidth / 2);
      let dateString = convertDateToString(xScale.invert(sliderCenterX));

      const newDateIndex = datesArray.indexOf(dateString);
      return [dateString, newDateIndex];
    };

    let datePromise = new Promise(function (resolve, reject) {
      resolve(() => setDateIndex(100));
    });
  }, [
    dateIndex,
    window.innerWidth,
    document.documentElement.clientWidth,
    document.getElementsByTagName("body")[0].clientWidth,
  ]);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ControlBar;
