import {Component, Input, OnInit} from '@angular/core';
import {LotType} from "./types";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";

@Component({
    selector: 'app-lot-info',
    templateUrl: './lot-info.component.html',
    styleUrls: ['./lot-info.component.css']
})
export class LotInfoComponent implements OnInit {
    euro2usd = (1.18).toString();
    @Input() data: LotType;
    calculated = {excise: '', fee: '', vat: '', sum: '', ship: '', fullSum: '', fullShip: ''};
    carPrice = '';
    carLocation = '';
    broker = 900;
    commission = 1000;
    auc = '';

    fuelToExciseExample = {
        // fuel type (as specified in copart)
        'DIESEL':{
            // higher breakpoint: excise rate; 0 - highest breakpoint? or something like that
            3.5:75,
            30:150,
            0:300
        },
        'GAS':{
            3:50,
            0:100
        },
        // if DEFAULT specified, it is used if fuel type is not specified, or no excise rate specified for this fuel type
        'DEFAULT':50
    };
    shippingPricesExample = {
        'TX':1300,
        'NY':1400,
        'OK':1500,
        'NV':1450
    };
    auctionFees = {
        // higher breakpoint: fee
        50:27.5,
        100:40,
        200:65,
        300:90,
        400:110,
        500:130,
        600:150,
        700:170,
        800:190,
        900:210,
        1000:230,
        1200:255,
        1300:290,
        1400:305,
        1500:315,
        1600:325,
        1700:345,
        1800:355,
        2000:375,
        2400:415,
        2500:425,
        3000:455,
        3500:565,
        4000:615,
        4500:640,
        5000:665,
        6000:765,
        7500:790,
        10000:890,
        15000:1050,
        // if less than 1, than it's a %
        0:0.10
    };

    bigScreen = false;

    myControl = new FormControl();
    options: string[] = Object.keys(this.shippingPricesExample);
    filteredOptions: Observable<string[]>;

    constructor(public breakpointObserver: BreakpointObserver) { }

    ngOnInit() {
        this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value))
        );
        this.breakpointObserver
            .observe(['(min-width: 1200px)'])
            .subscribe((state: BreakpointState) => {
                this.bigScreen = state.matches;
            });
    }
    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
    }

    calculate() {
        let exciseRateEur = this.fuelToExciseExample['DEFAULT'];
        let volume = 2.5;
        let year = 2020;
        let price = 0;
        let euroUsd = 1.18;
        let aucFee = this.auctionFees['0'];
        // try catch?
        volume = parseFloat(this.data.engine.split('L')[0]);
        year = parseInt(this.data.year);
        price = parseInt((this.carPrice)?this.carPrice:this.data.lot.currentBid);
        euroUsd = parseFloat(this.euro2usd);
        //
        Object.keys(this.fuelToExciseExample).forEach(key => {
            if (key !== 'DEFAULT' && this.data.fuel === key) {
                exciseRateEur = parseFloat(this.fuelToExciseExample[key]['0']);
                Object.keys(this.fuelToExciseExample[key]).forEach(exciseRateKey => {
                    if (volume < parseFloat(exciseRateKey)) {
                        exciseRateEur = parseFloat(this.fuelToExciseExample[key][exciseRateKey]);
                    }
                });
            }
        });
        for(let key of Object.keys(this.auctionFees)) {
            if (price < parseFloat(key)) {
                aucFee = this.auctionFees[key];
                break;
            }
        }
        if (aucFee < 1) {
            // if aucFee is a percentage of car price - translate it from percentage into usd
            aucFee = Math.round(aucFee * price * 100)/100;
        }
        this.auc = aucFee.toString();
        const coef = (new Date().getFullYear() - year);

        // акциз
        const exciseSumEur = exciseRateEur * (volume) * (coef > 0? coef : 1);
        const exciseSumUsd = exciseSumEur * euroUsd;

        // пошлина
        const feeUsd = Math.round((price + aucFee + exciseSumUsd) * 0.1 * 100)/100;
        // ндс
        const vatUsd = Math.round((price + aucFee + exciseSumUsd + feeUsd) * 0.2 * 100)/100;

        const sumUsd = Math.round((exciseSumUsd + feeUsd + vatUsd) * 100)/100;

        this.calculated.excise = `€${Math.round(exciseSumEur*euroUsd * 100) / 100} ($${exciseSumUsd})`;
        this.calculated.fee = `€${Math.round(feeUsd*euroUsd * 100) / 100} ($${feeUsd})`;
        this.calculated.vat = `€${Math.round(vatUsd*euroUsd * 100) / 100} ($${vatUsd})`;
        this.calculated.sum = `€${Math.round(sumUsd*euroUsd * 100) / 100} ($${sumUsd})`;

        // shipping
        let state = (this.carLocation)?this.carLocation:this.data.location.state;
        let shipCost = 0;
        Object.keys(this.shippingPricesExample).forEach(key => {
            if (state === key) {
                shipCost = this.shippingPricesExample[key];
            }
        });
        this.calculated.ship = `€${Math.round(shipCost*euroUsd * 100) / 100} ($${shipCost})`;
        let fullShip = shipCost+this.broker+this.commission;

        this.calculated.fullShip = `€${Math.round((fullShip)*euroUsd * 100) / 100} ($${fullShip})`;

        // full sum
        let fullSum = Math.round((sumUsd+fullShip+price)*100)/100;
        this.calculated.fullSum = `€${Math.round(fullSum*euroUsd * 100) / 100} ($${fullSum})`
    }
    onE2UChange(e2u) {
        this.euro2usd = e2u;
        this.calculate();
    }
    onCPChange(cp) {
        this.carPrice = cp;
        this.calculate();
    }
    onLocChange(location) {
        this.carLocation = location;
        this.calculate();
    }
}
