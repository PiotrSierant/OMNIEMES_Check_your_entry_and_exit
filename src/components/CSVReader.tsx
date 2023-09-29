"use client";

import React, { useState } from "react";
import CSVSelector from "./CSVSelector";
const options: Intl.DateTimeFormatOptions = { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit',
};
const CSVReader = () => {
  const [data, setData] = useState<string[][]>([]);

  const filteredLists = data.slice(1, data.length - 7).map(arr => arr.slice(2)).map(arr => arr.slice(0, arr.length - 3)).map(arr => arr.slice());
  const headers = data[0]?.filter(header => header !== "");
  const filteredArrays = filteredLists.map(row => {
    return row.filter((value, index) => headers[index] !== "" ? value : undefined);
  });
  const results = filteredArrays.map((element) => {
    return element.filter((_, index) => index !== 2)
  })
  const title = results[0];
  const filteredResults = results.filter(element => element.includes("Door Access Granted")).map(arr => arr.map(element => element.replace(/\[\d+\]: /g, '')));

  const finnalyTitle = title?.filter((_, index) => index !== 1)
  const finnalyBody = filteredResults.map(element => {
    return element.filter((_,index) => index !== 1)
  })
 

  return (
    <div className="flex flex-col justify-center items-center w-100">
      <CSVSelector onChange={(_data) => setData(_data)} />
      {data && <section>
      </section>}
      {data.length !== 0 && <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead>
          <tr>
          {finnalyTitle?.map(title => {
            return <th key={title} className="text-left">{title}</th>
          })}
            </tr>
        </thead>
        <tbody>
          {finnalyBody?.map((rowData, i) => {
            return (
              <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                {rowData?.map((data, j) => {
                  if (j === 0) {
                    const date = new Date(data)
                    var formatedDate = date.toLocaleDateString('pl-PL', options);
                    return <td key={j}>{ formatedDate }</td>
                  }
                  return <td key={j}>{data}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>}
    </div>
  );
};

export default CSVReader;