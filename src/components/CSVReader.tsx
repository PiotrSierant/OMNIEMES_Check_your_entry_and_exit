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
function addMissingEntries(data: string[][]) {
  const datesCount: { [key: string]: number } = {};
    for (const entry of data) {
      const date = entry[0].split(' ')[0]; 
        datesCount[date] = (datesCount[date] || 0) + 1;
  }
  for (let i = 0; i < data.length; i++) {
    const dateSplit = data[i][0].split(' ');
    const date = dateSplit[0]; 
    const hours = dateSplit[1] + dateSplit[2];
    if (datesCount[date] === 1) {
        const isAM = hours.includes("AM");
        const missingEntry = [date, "brak danych", "brak danych", data[i][3]];
      if (isAM) {
        data.splice(i, 0, missingEntry); // Dodaj przed wpisem
        i++;
      } else {
        data.splice(i + 1, 0, missingEntry); // Dodaj po wpisie
        i++;
      }
      }
  }
  return data
}
  
const CSVReader = () => {
  const [data, setData] = useState<string[][]>([]);

  const filteredLists = data.slice(1, data.length - 7).map(arr => arr.slice(2)).map(arr => arr.slice(0, arr.length - 3)).map(arr => arr.slice());
  const headers = data[0]?.filter(header => header !== "");
  const filteredArrays = filteredLists.map(row => row.filter((value, index) => headers[index] !== "" ? value : undefined));
  const results = filteredArrays.map((element) => element.filter((_, index) => index !== 2));
  const title = results[0];
  const filteredResults = results.filter(element => element.includes("Door Access Granted")).map(arr => arr.map(element => element.replace(/\[\d+\]: /g, '')));
  const finnalyTitle = title?.filter((_, index) => index !== 1)
  const finnalyBody = filteredResults.map(element => element.filter((_, index) => index !== 1));
  const addingMissingEntries = addMissingEntries(finnalyBody);

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
          {addingMissingEntries?.map((rowData, i) => {
            return (
              <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                {rowData?.map((data, j) => {
                  if (j === 0) {
                    const date = new Date(data)
                    let formatedDate: React.ReactNode = date.toLocaleDateString('pl-PL', options);
                    if(formatedDate && typeof formatedDate === 'string' && formatedDate.includes("00:00:00")) {
                        formatedDate = <span style={{ fontWeight: 'bold', color: 'red' }}>Brak danych {formatedDate.replace(" 00:00:00", "")}</span>;
                    }
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