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

const ControlBar = ({
  datesArray,
  dateIndex,
  transitionTime,
  setStart,
  setDateIndex,
  setListsForDateIndex,
}) => {
  const svgRef = useRef();

  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  const [scaleMax, setScaleMax] = useState(0);

  useEffect(() => {
    //console.log(document.activeElement.clientHeight);

    const svgWidth =
      0.8 * window.innerWidth ||
      0.8 * document.documentElement.clientWidth ||
      0.8 * document.getElementsByTagName("body")[0].clientWidth;
    const svgHeight =
      0.055 * window.innerHeight ||
      0.055 * document.documentElement.clientHeight ||
      0.055 * document.getElementsByTagName("body")[0].clientHeight;
    const svg = select(svgRef.current)
      .attr("width", svgWidth)
      .attr("height", svgHeight);
    const barWidth = 0.06 * svgHeight;
    const sliderWidth = (2 / 50) * svgWidth;
    const sliderHeight = barWidth * 12;
    const margin = { top: 20, right: 20, bottom: 0, left: 20 };
    const chartGroupWidth = svgWidth - margin.left - margin.right;
    const chartGroupHeight = svgHeight - margin.top - margin.bottom;

    /* const yScale = scaleLinear()
      .domain(extent(list, (value, index) => index))
      .range([0, (list.length * svgHeight) / 10.7]); */

    /* const calculateScaleMax = () => {
      const instantMax = max(list, (entry) => entry[queryType]);

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
    }; */

    const minDate = convertStringToDate(datesArray[0]);
    const maxDate = convertStringToDate(datesArray[datesArray.length - 1]);

    const xScale = scaleTime()
      .domain([minDate, maxDate])
      .range([0, chartGroupWidth]);

    const xAxis = axisTop(xScale).ticks(5);
    /*  const colorScale = scaleOrdinal()
      .domain(allCountries.map((country) => country))
      .range(schemeSet2); */

    const chartGroup = svg
      .selectAll(".controlbar-group")
      .data([1])
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "controlbar-group")
          .attr("height", chartGroupHeight)
          .attr("width", chartGroupWidth)
      )
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //console.log(chartGroup);
    chartGroup
      .selectAll(".across-bar")
      .data([dateIndex])
      .join((enter) => enter.append("rect").attr("class", "across-bar"))
      .attr("x", 0)
      .attr("y", -barWidth)
      .attr("width", chartGroupWidth)
      .attr("height", barWidth)
      .attr("fill", "gray");

    //console.log(document.getElementsByClassName("across-bar")[0]);

    chartGroup
      .selectAll(".date-axis")
      .data([1])
      .join((enter) =>
        enter.append("g").attr("class", "date-axis").call(xAxis)
      );

    const slider = chartGroup
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
        .on("drag", () => {
          setStart(false);
          const dateString = positionSlider();
          setDateIndex(datesArray.indexOf(dateString));
          setListsForDateIndex(datesArray.indexOf(dateString));
          //console.log(convertDateToString(xScale.invert(sliderX)));
        })
        .on("end", () => {
          const dateString = positionSlider();
          setListsForDateIndex(datesArray.indexOf(dateString));
          //console.log(dateString);
          //console.log(datesArray.indexOf(dateString));
          //console.log("mouseup has been called");
        })
    );
    const positionSlider = () => {
      let sliderX = event.x;
      let dateString = convertDateToString(xScale.invert(sliderX));
      slider.attr("x", event.x - sliderWidth / 2);
      return dateString;
    };

    let datePromise = new Promise(function (resolve, reject) {
      resolve(() => setDateIndex(100));
    });

    /* chartGroup
      .append("rect")
      .attr("y", -(barWidth + (sliderHeight - barWidth) / 2))
      .attr("width", sliderWidth)
      .attr("height", sliderHeight)
      .attr("fill", "gray")
      .attr("stroke-width", "10em")
      .attr("rx", "1em")
      .attr("ry", "1em")
      .attr("opacity", 0.8)
      .attr("x", xScale(convertStringToDate(datesArray[dateIndex])));
 */
    //console.log(datesArray[dateIndex]);
  }, [dateIndex]);

  return (
    <div ref={wrapperRef} style={{ marginBottom: "1rem" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ControlBar;
