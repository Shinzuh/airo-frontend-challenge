import {Injectable} from '@angular/core';
import {Observable, from} from 'rxjs';
import {map} from 'rxjs/operators';
import Papa from 'papaparse';
import {CsvData} from '../models/csv-data.model';

@Injectable({
    providedIn: 'root'
})
export class CsvParserService {
    parseCsvFile(file: File): Observable<CsvData[]> {
        return from(this.readFile(file)).pipe(
            map(csvText => {
                const data = this.parseCsv(csvText);
                if (!data || data.length === 0) {
                    throw new Error();
                }

                return data;
            })
        );
    }

    private readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    private parseCsv(csvText: string): CsvData[] {
        const result = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true
        });

        return result.data as CsvData[];
    }
}
