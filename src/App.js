import React, { useState, useEffect } from "react";
import "./App.css";
import {
  getDateCountryListObject,
  getObservableList,
  getCompleteRatioLists,
} from "./logic/utilFunctions";

import RacingBarChart from "./Components/RacingBarChart";

import { data } from "./logic/coviddata.json";
import ControlBar from "./Components/ControlBar";

function App() {
  const [perCountryArrays, setPerCountryArrays] = useState([]);
  const [completeConfirmedLists, setCompleteConfirmedLists] = useState({});
  const [completeDeathsLists, setCompleteDeathsLists] = useState({});
  const [completeRatioLists, setCompleteRatioLists] = useState({});

  const [start, setStart] = useState(false);
  let [dateIndex, setDateIndex] = useState(0);
  const [allCountries, setAllCountries] = useState([]);
  const [datesArray, setDatesArray] = useState([]);

  const [transitionTime, setTransitionTime] = useState(500);
  const [isReseted, setIsReseted] = useState(false);

  useEffect(() => {
    const [retrievedListObject, countryList] = getDateCountryListObject(data);
    setAllCountries(Object.values(countryList));
    setPerCountryArrays(Object.values(retrievedListObject));
    const [
      observableCountriesObj,
      completeConfirmedLists,
      completeDeathsLists,
    ] = getObservableList(Object.values(retrievedListObject));
    const completeRatioLists = getCompleteRatioLists(
      Object.values(retrievedListObject)
    );

    setCompleteConfirmedLists(completeConfirmedLists);
    setCompleteDeathsLists(completeDeathsLists);
    setCompleteRatioLists(completeRatioLists);

    setDatesArray(Object.keys(retrievedListObject));

    getObservableList(Object.values(retrievedListObject));

    setIsLoading(false);
  }, []);
  const [isLoading, setIsLoading] = useState(true);

  const selectNewLists = () => {
    if (dateIndex === perCountryArrays.length - 1) {
      setStart(false);
    }
    setDateIndex(dateIndex);

    dateIndex++;
  };

  const resetear = () => {
    setIsReseted(true);
    setStart(false);
    setDateIndex(0);
  };

  return (
    <div className="App">
      <h1>COVID RACING BAR CHART</h1>
      <div className="buttons-and-date">
        <button
          onClick={() => {
            setStart(!start);
            setIsReseted(false);
          }}
          className={`start-button ${
            dateIndex < perCountryArrays.length - 1 ? "" : "hidden"
          }`}
        >
          {start ? "Stop" : "Start"}
        </button>
        <h2>{datesArray[dateIndex]}</h2>
        <button
          className="refresh-button"
          onClick={() => {
            resetear();
          }}
        >
          <span>&#8634;</span>
          <span className="tooltip refresh">Refresh</span>
          <span className="tooltip arrow"></span>
        </button>
      </div>
      {isLoading ? (
        <p>LOADING ...</p>
      ) : (
        <ControlBar
          datesArray={datesArray}
          transitionTime={transitionTime}
          dateIndex={dateIndex}
          setDateIndex={setDateIndex}
          setStart={setStart}
          setIsReseted={setIsReseted}
        />
      )}

      {isLoading ? (
        <p>LOADING ...</p>
      ) : (
        <div className="rbc-parent">
          <div className="racing-bars-container">
            <RacingBarChart
              allCountries={allCountries}
              queryType={"confirmed"}
              transitionTime={transitionTime}
              isReseted={isReseted}
              chartTitle={"CONFIRMED CASES"}
              completeLists={completeConfirmedLists}
              start={start}
              dateIndex={dateIndex}
              setDateIndex={setDateIndex}
            />
            <RacingBarChart
              allCountries={allCountries}
              queryType={"deaths"}
              transitionTime={transitionTime}
              isReseted={isReseted}
              chartTitle={"DEATHS"}
              completeLists={completeDeathsLists}
              start={start}
              dateIndex={dateIndex}
              setDateIndex={setDateIndex}
            />
            <RacingBarChart
              allCountries={allCountries}
              queryType={"ratio"}
              transitionTime={transitionTime}
              isReseted={isReseted}
              chartTitle={"MORTALITY %"}
              completeLists={completeRatioLists}
              start={start}
              dateIndex={dateIndex}
              setDateIndex={setDateIndex}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
