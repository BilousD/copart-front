import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class ParserService {
    private BACK_URL = '/api/parse';

    constructor(private http: HttpClient) { }

    requestData(uri: string) {
        return this.http.post<{data: {
            lm,mkn,lcy,la,fv,cy,egn,ft,dd,drv,tmtp,tims,ld,sdd,syn,bstl,clr,zip,long,lat,locCity,locState,locCountry,lu,ad
                dynamicLotDetails:{
                buyerNumber,buyTodayBid,currentBid,sealedBid,hasBid,lotSold,bidStatus
                }
            }, image
        }>(this.BACK_URL, {uri});
    }

    requestCalc() {
        return this.http.get<{data: {
                shipping:{},
                excise:{},
                auction:[]
            }}>(this.BACK_URL);
    }

    requestRaw() {
        return this.http.get<{data: {
                shipping:{},
                excise:{},
                auction:[]
            }}>(this.BACK_URL + '/raw');
    }

    sendRaw(shipping, excise, auction, pass) {
        this.http.put<{}>(this.BACK_URL + '/params', {shipping, excise, auction, pass}).subscribe(() => {
            console.log('putted?');
        });
    }
}
