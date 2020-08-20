import { Component, OnInit } from '@angular/core';
import {ParserService} from "./parser.service";
import {LotType} from "./types";
@Component({
    selector: 'app-copart-extractor',
    templateUrl: './copart-extractor.component.html',
    styleUrls: ['./copart-extractor.component.css']
})
export class CopartExtractorComponent implements OnInit {

    // placeholder
    value = 'https://www.copart.com/lot/40427970';
    data: LotType;
    copPattern = '^https:\\/\\/(w{3}\\.)?copart\\.com\\/lot\\/[\\d]+[\\/\\w\\-]+$';

    constructor(private parserService: ParserService) { }

    ngOnInit(): void {
    }

    OnClick() {
        try {
            const url = new URL(this.value);
            this.parserService.requestData(url.pathname.toString().split('/')[2])
                .subscribe(res => {
                    this.data = {
                        marka: res.data.mkn,
                        model: res.data.lm,
                        year: res.data.lcy,
                        VIN: res.data.fv,
                        retailValue: res.data.la,
                        engine: res.data.egn,
                        cylinders: res.data.cy,
                        fuel: res.data.ft,
                        drive: res.data.drv,
                        transmission: res.data.tmtp,
                        bodyStyle: res.data.bstl,
                        color: res.data.clr,
                        photo: res.image,
                        damage: res.data.dd,
                        secondaryDamage: res.data.sdd,
                        lot: res.data.dynamicLotDetails,
                        lastUpdated: res.data.lu,
                        auctionDate: res.data.ad,
                        fullName: res.data.ld,
                        location: {
                            short: res.data.syn,
                            zip: res.data.zip,
                            long: res.data.long,
                            lat: res.data.lat,
                            city: res.data.locCity,
                            state: res.data.locState,
                            country: res.data.locCountry
                        }
                    };
                });
        } catch (e) {
            console.log(e);
        }
    }
}
