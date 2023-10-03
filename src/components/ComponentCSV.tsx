import CSVReader from 'react-csv-reader';
export const ComponentCSV = () => {
    return (
         <CSVReader
            parserOptions={{ header: true }}
            onFileLoaded={(element) => console.dir(element)}
        />
    )
}