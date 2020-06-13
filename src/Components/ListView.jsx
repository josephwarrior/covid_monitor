import React from "react";

const ListView = ({ list }) => {
  return (
    <ul>
      {Object.values(list).map((item, index) => {
        return (
          <li key={index}>
            <span>Date: {item.date}</span>
            <span>Country: {item.name}</span>
            <span>Deaths: {item.deaths}</span>
            <span>Confirmed: {item.confirmed}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default ListView;
