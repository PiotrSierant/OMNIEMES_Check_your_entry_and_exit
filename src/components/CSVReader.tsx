"use client";
import React, { useEffect, useState } from "react";
import CSVSelector from "./CSVSelector";
const options: Intl.DateTimeFormatOptions = { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit',
}; 
function filterData(data: string[][]) {
  let newData: string[][] = [];
  const datesCount: { [key: string]: number } = {};
    for (const entry of data) {
      const date = entry[0].split(' ')[0];
        datesCount[date] = (datesCount[date] || 0) + 1;
  }

  const res = Object.fromEntries(
    Object.entries(datesCount).filter(([key, value]) => value > 2)
  );
   
  data.forEach((element) => {
    const dateSplit = element[0].split(' ');
    const date = dateSplit[0];
    if (res[date]) {
    } else {
      newData.push(element)
    }
  })

  data.forEach((element) => {
    const dateSplit = element[0].split(' ');
    const date = dateSplit[0];
    if (res[date]) {
      const eventsWithTargetDate = data.filter(event => {
          const eventDate = event[0];
          return eventDate.startsWith(date);
      });
      newData.push(eventsWithTargetDate[0]);
      newData.push(eventsWithTargetDate[eventsWithTargetDate.length - 1]);
      delete res[date];
    }
  })

  return newData;
};
function removeExtraEntries(data: string[][]) {
    const groupedData: { [date: string]: string[][] } = {};
    data.forEach(item => {
        const dateWithoutTime = item[0].split(" ")[0];
        if (!groupedData[dateWithoutTime]) {
            groupedData[dateWithoutTime] = [];
        }
        groupedData[dateWithoutTime].push(item);
    });
    const result: string[][] = [];

    for (const date in groupedData) {
        const dateItems = groupedData[date];
        if (dateItems.length === 1) {
            result.push(dateItems[0]);
        } else {
            dateItems.sort((a, b) => {
                const dateA = new Date(a[0]).getTime(); // Pobieramy czas w milisekundach
                const dateB = new Date(b[0]).getTime(); // Pobieramy czas w milisekundach
                return dateA - dateB;
            });
            result.push(dateItems[0]);
            result.push(dateItems[1]);
        }
    }
    return result;
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
};
function calculateWorkTime(data: string[][]): { [date: string]: { time: string; } } {
    const workTime: { [date: string]: any } = {};
    data.forEach(item => {
      const date = item[0];
      const dateSingle = item[0].split(" ")[0];
      if (!workTime[dateSingle]) {
            workTime[dateSingle] = {};
        }
      if (date.includes('AM')) {
        workTime[dateSingle].start = date
      }
      if (date.includes('PM')) {
        workTime[dateSingle].end = date
      }
    });
  
    const keys = Object.keys(workTime);
    keys.forEach(key => {
      const start = workTime[key].start;
      const end = workTime[key].end;
      if (start === undefined) {
        workTime[key].start = ""
      } else if (end === undefined) {
        workTime[key].end = ""
      }
    });
    for (const date in workTime) {
      const start = new Date(workTime[date].start).getTime();
      const end = new Date(workTime[date].end).getTime();
      if (Number.isNaN(start)) {
        workTime[date] = {};
        workTime[date].time = "Nie można obliczyć h pracy"
      }
      else if (Number.isNaN(end)) {
        workTime[date] = {};
        workTime[date].time = "Nie można obliczyć h pracy"
      } else {
        const results = (end - start) / (1000 * 60);
        const hours = Math.floor(results / 60);
        const minutes = results % 60;
        workTime[date] = {};
        workTime[date].time = hours + 'h, ' + Math.floor(minutes) +'min.'
      }
  }
  return workTime;
};
function addTime(data: string[][], object: { [key: string]: { time: string } }) {
  const res = data.map((element, index) => {
    let date = element[0].split(" ")[0];
    if (index % 2 === 0) {
    element.push(object[date].time)      
    } else {
      element.push("")      
    }
    return element
  })
  return res
};
  
const CSVReader = () => {
  const [data, setData] = useState<string[][]>([]);
  const [resData, setResData] = useState<string[][]>([]);
  const [resDataTitle, setResDataTitle] = useState<string[]>([]);

  useEffect(() => {
    const filteredLists = data.slice(1, data.length - 7).map(arr => arr.slice(2)).map(arr => arr.slice(0, arr.length - 3)).map(arr => arr.slice());
    const headers = data[0]?.filter(header => header !== "");
    const filteredArrays = filteredLists.map(row => row.filter((value, index) => headers[index] !== "" ? value : undefined));
    const results = filteredArrays.map((element) => element.filter((_, index) => index !== 2));
    const title = results[0];
    const filteredResults = results.filter(element => element.includes("Door Access Granted")).map(arr => arr.map(element => element.replace(/\[\d+\]: /g, '')));
    const test = filterData(filteredResults);
    const finnalyTitle = title?.filter((_, index) => index !== 1);
    const finnalyBody = test.map(element => element.filter((_, index) => index !== 1));
    const res = removeExtraEntries(finnalyBody).sort((a: string[], b: string[]) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    const addingMissingEntries = addMissingEntries(res);
    const calculate = calculateWorkTime(res);
    const resultsCVS = addTime(addingMissingEntries, calculate);
    finnalyTitle?.push('Czas pracy');
    setResData(resultsCVS);
    setResDataTitle(finnalyTitle);
  }, [data]);

  return (
    <div className="flex flex-col justify-center items-center w-100">
      <CSVSelector onChange={(_data) => setData(_data)} />
      {data && <section>
      </section>}
      {data.length !== 0 && <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead>
          <tr>
          {resDataTitle?.map(title => {
            return <th key={title} className="text-left">{title}</th>
          })}
            </tr>
        </thead>
        <tbody>
          {resData?.map((rowData, i) => {
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