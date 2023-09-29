"use client";
import React from "react";
type Props = {
  onChange(data: string[][]): void;
};

const CSVSelector = ({ onChange }: Props) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const file = e.target.files[0];
        const fileUrl = URL.createObjectURL(file);

        const response = await fetch(fileUrl);
        const text = await response.text();
        const lines = text.split("\n");
        const _data = lines.map((line) => line.split(","));
        onChange(_data);
      } catch (error) {
        console.error(error);
      }
    }
  };
  return <input type="file" accept=".csv" onChange={handleFileChange} className="py-4" />
};

export default CSVSelector;