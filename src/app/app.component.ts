import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  publicHolidaysDates: { Date: Date, Holiday: string }[] = [];
  title = 'Calculator';
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getPublicHolidays();
  }
 
  getPublicHolidays() {
    this.http.get('https://openholidaysapi.org/PublicHolidays?countryIsoCode=DE&languageIsoCode=EN&validFrom=2024-01-01&validTo=2024-12-31&').subscribe(
      (result) => {
        for (let [key, value] of Object.entries(result)) {
          if (value['nationwide']) {
            this.publicHolidaysDates.push({Date: new Date(value['startDate']), Holiday: value['name'][0]['text']})
            } 
        }
        console.log(this.publicHolidaysDates);
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
