"use client";
import React from "react";
import Papa from "papaparse";
type Props = {
  onChange(data: string[][]): void;
};

const CSVSelector = ({ onChange }: Props) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const file = e.target.files[0];

        Papa.parse<string[]>(file, {
          worker: true, // use worker so that the page doesn't hang up
          complete({ data }) {
            onChange(data);
          },
        });
        // 6. call the onChange event
      } catch (error) {
        console.error(error);
      }
    }
  };
  return <input type="file" accept=".csv" onChange={handleFileChange} />;
};

export default CSVSelector;