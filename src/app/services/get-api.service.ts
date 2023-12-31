import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs';
import { sunsetSunrise, tempo } from '../models/type';

@Injectable({
  providedIn: 'root'
})
export class GetApiService {

  constructor(private apiService: ApiService) { }

  getSearchSunsetSunriseByLatLong(lat: string, long: string) {
    return this.apiService.searchSunsetSunriseByLatLong(lat, long).pipe(
      map((res: any) => {
        return res as sunsetSunrise;
      })
    )
  }
  
  getSearchTempoByLatLong(lat: string, long: string) {
    return this.apiService.searchTempoByLatLong(lat, long).pipe(
      map((res: any) => {
        res=this.addImg(res);
        res=this.calculateTime(res);
        return res as tempo;
      })
    )
  }

  //in base ai valori nell'oggetto aggiungo l'icona più corretta: sole, pioggia, neve, nuvoloso...
  addImg(res:any){
    res.dataseries.forEach((e: any) => {
      if (e.prec_type === "none") {
        if (e.cloudcover <= 2) {
          e.img = "https://www.7timer.info/img/misc/about_two_clear.png";
        }
        else if (e.cloudcover >= 3 && e.cloudcover <= 7) {
          e.img = "https://www.7timer.info/img/misc/about_two_pcloudy.png";
        }
        else if (e.cloudcover >= 8) {
          e.img = "https://www.7timer.info/img/misc/about_two_cloudy.png";
        }
      } else if (e.prec_type === "snow") {
        e.img = "https://www.7timer.info/img/misc/about_two_snow.png";
      } else if (e.prec_type === "rain") {
        if (e.lifted_index <= -5) {
          e.img = "https://www.7timer.info/img/misc/about_two_tsrain.png";
        } else
          e.img = "https://www.7timer.info/img/misc/about_two_rain.png";
      }
    });
    return res;
  }

  //converte le ore 3,6,9,12 ecc in un'orario corretto partendo dalla data attuale
  calculateTime(res:any) {
    res.dataseries.forEach((e: any) => {
      let date = new Date(new Date().getTime() + (e.timepoint+1) * 60 * 60 * 1000);
      e.timepoint = date.toUTCString().slice(0, -4);
    });
    return res;
  }

  //richiesta API extra all'esame per trovare il nome della città date le coordinate
  getSearchCityByLatLong(lat:string, long:string){
    return this.apiService.searchCityByLatLong(lat, long).pipe(
      map((res:any)=>{
        return res.city.toUpperCase() as string;
      })
    )
  }
}
