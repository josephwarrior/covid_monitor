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
  scaleTime,
  drag,
  event,
} from "d3";
import useResizeObserver from "../logic/useResizeObserver";
import {
  convertStringToDate,
  convertDateToString,
} from "../logic/utilFunctions";
import { chartFunction } from "../logic/chartFunction";

const RacingBarChart3 = ({
  allCountries,
  queryType,
  transitionTime,
  isReseted,
  setIsReseted,
  chartTitle,
  completeConfirmedLists,
  start,
  setStart,
  datesArray,
  setDateInd,
}) => {
  const [confList, setConfList] = useState(
    Object.values(completeConfirmedLists)[0]
  );
  let [intervalId, setIntervalId] = useState(0);
  let [dateIndex, setDateIndex] = useState(0);
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  const [scaleMax, setScaleMax] = useState(0);

  const updateList = () => {
    if (dateIndex === Object.values(completeConfirmedLists).length - 1) {
      clearInterval(intervalId);
      return;
    }
    //console.log(intervalId);
    setConfList(Object.values(completeConfirmedLists)[dateIndex]);

    dateIndex = dateIndex + 1;
    setDateIndex(dateIndex);
    setDateInd(dateIndex);
  };

  // will be called initially and on every data change
  useEffect(() => {
    // console.log(dateIndex);
    if (start && intervalId === 0) {
      intervalId = setInterval(() => updateList(), transitionTime);
      setIntervalId(intervalId);
    } else {
      intervalId !== 0 && clearInterval(intervalId);
      intervalId = 0;
      setIntervalId(0);
    }
  }, [start]);

  const svgWidth =
    0.8 * window.innerWidth ||
    0.8 * document.documentElement.clientWidth ||
    0.8 * document.getElementsByTagName("body")[0].clientWidth;
  const svgHeight =
    1 * window.innerHeight ||
    1 * document.documentElement.clientHeight ||
    1 * document.getElementsByTagName("body")[0].clientHeight;
  const controlWidth = svgWidth * 0.95;
  const controlBarWidth = (1 / 185) * svgHeight;
  const barwidth = (6 / 185) * svgHeight;
  const controlMargin = { top: 40, right: 20, bottom: 0, left: 40 };
  const confMargin = { top: 150, right: 20, bottom: 0, left: 40 };
  const chartGroupWidth = svgWidth / 3 - confMargin.left - confMargin.right;
  const chartGroupHeight = svgHeight - confMargin.top - confMargin.bottom;
  const sliderWidth = (2 / 50) * svgWidth;
  const sliderHeight = controlBarWidth * 12;
  const svg = select(svgRef.current)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  useEffect(() => {
    chartFunction(
      svg,
      dateIndex,
      isReseted,
      setDateIndex,
      setConfList,
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
      "confirmed",
      completeConfirmedLists,
      confList
    );
  }, [start, isReseted, confList, dimensions, dateIndex]);

  const minDate = convertStringToDate(datesArray[0]);
  const maxDate = convertStringToDate(datesArray[datesArray.length - 1]);

  const xControlScale = scaleTime()
    .domain([minDate, maxDate])
    .range([0, controlWidth]);

  const xControlAxis = axisTop(xControlScale).ticks(5);

  const controlBarGroup = svg
    .selectAll(".controlbar-group")
    .data([1])
    .join((enter) =>
      enter
        .append("g")
        .attr("class", "controlbar-group")
        .attr("height", chartGroupHeight)
        .attr("width", chartGroupWidth)
    )
    .attr(
      "transform",
      "translate(" + controlMargin.left + "," + controlMargin.top + ")"
    );

  controlBarGroup
    .selectAll(".across-bar")
    .data([dateIndex])
    .join((enter) => enter.append("rect").attr("class", "across-bar"))
    .attr("x", 0)
    .attr("y", -controlBarWidth)
    .attr("width", controlWidth)
    .attr("height", controlBarWidth)
    .attr("fill", "gray");

  controlBarGroup
    .selectAll(".date-axis")
    .data([1])
    .join((enter) =>
      enter.append("g").attr("class", "date-axis").call(xControlAxis)
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
              xControlScale(convertStringToDate(datesArray[entry])) -
              sliderWidth / 2
            );
          }),
      (update) =>
        update
          .transition()
          .duration(transitionTime)
          .ease(easeLinear)
          .attr("x", (entry) => {
            return (
              xControlScale(convertStringToDate(datesArray[entry])) -
              sliderWidth / 2
            );
          })
    )
    .attr("y", -(controlBarWidth + (sliderHeight - controlBarWidth) / 2))
    .attr("width", sliderWidth)
    .attr("height", sliderHeight)
    .attr("fill", "gray")
    .attr("stroke-width", "10em")
    .attr("rx", "0.3em")
    .attr("ry", "0.3em")
    .attr("opacity", 0.8);

  slider.call(
    drag()
      .on("start", () => {
        // console.log("start has been called");
        setIsReseted(false);

        let [dateString, newDateIndex] = positionSlider();
        dateIndex = newDateIndex;
        setDateIndex(newDateIndex);
        setDateInd(dateIndex);
        setConfList(completeConfirmedLists[dateString]);
        setStart(false);
      })
      .on("drag", (e) => {
        //console.log("drag has been called");
        let [dateString, newDateIndex] = positionSlider();
        dateIndex = newDateIndex;
        setDateIndex(newDateIndex);
        setDateInd(dateIndex);
        setConfList(completeConfirmedLists[dateString]);
      })
      .on("end", () => {
        // console.log("end has been called");
        let [dateString, newDateIndex] = positionSlider();
        dateIndex = newDateIndex;
        setDateIndex(newDateIndex);
        setDateInd(dateIndex);
        setConfList(completeConfirmedLists[dateString]);
      })
  );

  const positionSlider = () => {
    let sliderCenterX = event.x < 0 ? 0 : event.x;
    sliderCenterX = sliderCenterX > controlWidth ? controlWidth : sliderCenterX;
    slider
      .transition()
      .duration(20)
      .attr("x", sliderCenterX - sliderWidth / 2);
    let dateString = convertDateToString(xControlScale.invert(sliderCenterX));

    const newDateIndex = datesArray.indexOf(dateString);
    return [dateString, newDateIndex];
  };

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

export default RacingBarChart3;
