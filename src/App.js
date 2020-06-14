import React, { useState, useEffect } from "react";
import "./App.css";
//import ListView from "./Components/ListView";
import {
  getDateCountryListObject,
  getTopLists,
  getObservableList,
} from "./logic/utilFunctions";
import { getRegistersFetch } from "./logic/services";
import RacingBarChart from "./Components/RacingBarChart";
import ControlBar from "./Components/ControlBar";
import { data } from "./logic/coviddata.json";

function App() {
  const [perCountryArrays, setPerCountryArrays] = useState([]);
  const [confirmedList, setConfirmedList] = useState({});
  const [deathsList, setDeathsList] = useState({});
  const [ratioList, setRatioList] = useState({});
  const [dailyConfirmedList, setDailyConfirmedList] = useState({});
  const [dailyDeathsList, setDailyDeathsList] = useState({});
  const [dailyRatioList, setDailyRatioList] = useState({});

  const [start, setStart] = useState(false);
  let [dateIndex, setDateIndex] = useState(0);
  const [allCountries, setAllCountries] = useState([]);
  const [datesArray, setDatesArray] = useState([]);

  const [intervalId, setIntervalId] = useState(0);
  const [transitionTime, setTransitionTime] = useState(1000);
  const [isReseted, setIsReseted] = useState(false);

  useEffect(() => {
    //getRegistersFetch()
    // .then((data) => {
    // console.log(data);
    const [retrievedListObject, countryList] = getDateCountryListObject(data);
    setAllCountries(Object.values(countryList));
    setPerCountryArrays(Object.values(retrievedListObject));

    Object.values(retrievedListObject).forEach((listForCountry) => {
      Object.values(listForCountry).forEach((entry) => {
        //if (entry.country === "France") console.log(entry);
        if (
          entry.deaths < 0 ||
          entry.confirmed < 0 ||
          entry.dailyConfirmed < 0 ||
          entry.daylyDeaths < 0
        ) {
          console.log(
            entry.country +
              ", date: " +
              entry.date +
              ", deaths: " +
              entry.deaths +
              ", confirmed: " +
              entry.confirmed +
              ", dailyConfirmed: " +
              entry.dailyConfirmed +
              ", dailyDeaths: " +
              entry.dailyDeaths
          );
        }
      });
    });

    setDatesArray(Object.keys(retrievedListObject));

    getObservableList(Object.values(retrievedListObject));

    const initialPerCountryListObject = Object.values(retrievedListObject)[0];
    const initialPerCountryArray = Object.values(initialPerCountryListObject);
    setConfirmedList(initialPerCountryArray);
    setDeathsList(initialPerCountryArray);
    setRatioList(initialPerCountryArray);
    setDailyConfirmedList(initialPerCountryArray);
    setDailyDeathsList(initialPerCountryArray);
    setDailyRatioList(initialPerCountryArray);
    setIsLoading(false);
    // })
    // .catch((error) => console.log(error));
  }, []);
  const [isLoading, setIsLoading] = useState(true);

  const selectNewLists = () => {
    if (dateIndex === perCountryArrays.length - 1) {
      setStart(false);
    }
    setDateIndex(dateIndex);
    setListsForDateIndex(dateIndex);
    dateIndex++;
  };

  const setListsForDateIndex = (dateIndex) => {
    const [
      topConfirmedList,
      topDeathsList,
      topRatioList,
      /*  topNDailyConfirmedList,
      topNDailyDeathsList,
      topNDailyRatioList, */
    ] = getTopLists(perCountryArrays, dateIndex, 300);
    setConfirmedList(topConfirmedList);
    setDeathsList(topDeathsList);
    setRatioList(topRatioList);
    //console.log(topConfirmedList);
    /* setDailyConfirmedList(topNDailyConfirmedList);
    setDailyDeathsList(topNDailyDeathsList);
    setDailyRatioList(topNDailyRatioList); */
  };

  useEffect(() => {
    if (start && dateIndex < perCountryArrays.length) {
      const id = setInterval(selectNewLists, transitionTime);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
    }
  }, [start]);

  const resetear = () => {
    setIsReseted(true);
    setStart(false);
    setDateIndex(0);
    setConfirmedList(Object.values(perCountryArrays[0]));
    setDeathsList(Object.values(perCountryArrays[0]));
    setRatioList(Object.values(perCountryArrays[0]));
    /*  setDailyConfirmedList(Object.values(perCountryArrays[0]));
    setDailyDeathsList(Object.values(perCountryArrays[0]));
    setDailyRatioList(Object.values(perCountryArrays[0])); */
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
        <p>loading...</p>
      ) : (
        <ControlBar
          datesArray={datesArray}
          dateIndex={dateIndex}
          transitionTime={transitionTime}
          setStart={setStart}
          setDateIndex={setDateIndex}
          setListsForDateIndex={setListsForDateIndex}
        />
      )}
      {isLoading ? (
        <p>LOADING ...</p>
      ) : (
        <div className="racing-bars-container">
          <RacingBarChart
            list={confirmedList}
            allCountries={allCountries}
            queryType={"confirmed"}
            transitionTime={transitionTime}
            isReseted={isReseted}
            chartTitle={"Confirmed cases"}
            dateIndex={dateIndex}
          />
          <RacingBarChart
            list={deathsList}
            allCountries={allCountries}
            queryType={"deaths"}
            transitionTime={transitionTime}
            isReseted={isReseted}
            chartTitle={"Deaths"}
            dateIndex={dateIndex}
          />
          <RacingBarChart
            list={ratioList}
            allCountries={allCountries}
            queryType={"ratio"}
            transitionTime={transitionTime}
            isReseted={isReseted}
            chartTitle={"Fatality %"}
            dateIndex={dateIndex}
          />
        </div>
      )}
    </div>
  );
}

export default App;
