import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { DxDateBoxComponent, DxDateBoxModule } from 'devextreme-angular';

@Component({
  selector: 'entry',
  templateUrl: './entry.html',
  styleUrls: ['./entry.css']
})
export class Entry implements OnInit {

  @Input() day: string = "Day 1";
  @Input() publicHolidays!: { Date: Date; Holiday: string; }[];
  startTime: any | undefined;
  endTime: any | undefined;
  breakStartTime: any | undefined;
  breakEndTime: any | undefined;
  dayShiftHours: number = 0;
  nightShiftHours: number = 0;
  weekendHours: number = 0;
  sundayHours: number = 0;
  publicHolidayHours: number = 0;
  gridDataSource: { startTime: Date; endTime: Date; breakStartTime: Date; breakEndTime: Date; dayShiftHours: number; nightShiftHours: number; weekendHours: number; sundayHours: number; publicHolidayHours: number; }[] =[];
  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.gridDataSource = [];
  }

  addRow(): void {
    this.gridDataSource.push({  startTime: new Date(), endTime:new Date(), breakStartTime: new Date(), breakEndTime: new Date(),
       dayShiftHours: 0, nightShiftHours: 0, weekendHours: 0, sundayHours: 0, publicHolidayHours: 0 })
}


  checkIfPublicHoliday(date: Date) {
    if (this.publicHolidays.find(h => h.Date.getDate() === date.getDate() && h.Date.getMonth() === date.getMonth())) {
      return true;
    }
    else {
      return false;
    }
  }

  checkIfSunday(date: Date) {
    return date.getDay() == 0;
  }

  checkIfSaturday(date: Date) {
    return date.getDay() == 6;
  }

  checkIfNightShift(date: Date) {
    return date.getHours() < 6 || date.getHours() === 23 ;
  }

  doTheMagic(startDate: Date, endDate: Date, data: any, isBreak: boolean) {
    let newStartDate = new Date(startDate.getTime());
    let minutes = 0;
    if (startDate.getMinutes() !== 0) {
      minutes = 60 - startDate.getMinutes();
    }
    else {
      const tmpNewDate = new Date(newStartDate.setMinutes(newStartDate.getMinutes() + 60));
      newStartDate.setMinutes(newStartDate.getMinutes() - 60)
      if(endDate < tmpNewDate){
        minutes = endDate.getMinutes();
      }
      else{
        minutes = 60;
      }
    }
    //do the checks here and then add the 60 min
    if (endDate <= startDate) {
      return;
    }
    else {
      if (this.checkIfPublicHoliday(newStartDate)) {
        if(isBreak){
          data.publicHolidayHours -= minutes;
        }
        else{
          data.publicHolidayHours += minutes;
        }
      }
      else if (this.checkIfSunday(newStartDate)) {
        if(isBreak){
          data.sundayHours -= minutes;
        }
        else{
          data.sundayHours += minutes;
        }
      }
      else if (this.checkIfSaturday(newStartDate)) {
        if (this.checkIfNightShift(newStartDate)) {
          if(isBreak){
            data.nightShiftHours -= minutes;
          }
          else{
            data.nightShiftHours += minutes;
          }
        }
        else {
          if(isBreak){
            data.weekendHours -= minutes;
          }
          else{
            data.weekendHours += minutes;
          }
        }
      }
      else {
        if (this.checkIfNightShift(newStartDate)) {
          if(isBreak){
            data.nightShiftHours -= minutes;
          }
          else{
            data.nightShiftHours += minutes;  
          }
        }
        else {
          if(isBreak){
            data.dayShiftHours -= minutes;
          }
          else{
            data.dayShiftHours += minutes;  
          }
        }
      }
      newStartDate.setMinutes(newStartDate.getMinutes() + minutes);
      this.doTheMagic(newStartDate, endDate, data, isBreak);
    }
  }

  calculateTotal(){
    this.resetValues();
    this.gridDataSource.forEach(r=> {
      this.dayShiftHours += r.dayShiftHours;
      this.nightShiftHours += r.nightShiftHours;
      this.weekendHours += r.weekendHours;
      this.sundayHours += r.sundayHours;
      this.publicHolidayHours += r.publicHolidayHours;
    });

  }
  resetValues() {
    this.dayShiftHours = this.nightShiftHours = this.publicHolidayHours = this.sundayHours = this.weekendHours = 0;
  }
  calculate(data:any) {
    if (data.data.endTime && data.data.startTime) {
      data.data.nightShiftHours = data.data.dayShiftHours = data.data.weekendHours = data.data.publicHolidayHours = data.data.sundayHours = 0;
      this.doTheMagic(data.data.startTime, data.data.endTime, data.data, false);
      this.doTheMagic(data.data.breakStartTime, data.data.breakEndTime, data.data, true);
      //this.calculateTotal();
    }
  }
}
