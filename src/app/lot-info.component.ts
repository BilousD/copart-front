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
    calculated = {excise: '', fee: '', vat: '', sum: '', ship: '', fullSum: ''};
    carPrice = '';
    carLocation = '';

    fuelToExciseExample = {
        // fuel type (as specified in copart)
        'DIESEL':{
            // excise rate: [lower breakpoint,higher breakpoint]
            75:[0,3.5],
            150:[3.5,30],
            300:[30]
        },
        'GAS':{
            50:[0,3],
            100:[3]
        },
        // if DEFAULT specified, it is used if fuel type is not specified, or no excise rate specified for this fuel type
        'DEFAULT':50
    };
    shippingPricesExample = {
        'TX':1300,
        'NY':1400,
        'OK':1500,
        'NV':1450
    }

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
        // try catch?
        volume = parseFloat(this.data.engine.split('L')[0]);
        year = parseInt(this.data.year);
        price = parseInt((this.carPrice)?this.carPrice:this.data.lot.currentBid);
        euroUsd = parseFloat(this.euro2usd);
        //
        Object.keys(this.fuelToExciseExample).forEach(key => {
            if (key !== 'DEFAULT' && this.data.fuel === key) {
                Object.keys(this.fuelToExciseExample[key]).forEach(exciseRateKey => {
                    const arr = this.fuelToExciseExample[key][exciseRateKey];
                    if (volume > arr[0] && (!arr[1] || volume < arr[1])) {
                        exciseRateEur = parseInt(exciseRateKey);
                    }
                });
            }
        });

        const coef = (new Date().getFullYear() - year);

        // акциз
        const exciseSumEur = exciseRateEur * (volume) * (coef > 0? coef : 1);
        const exciseSumUsd = exciseSumEur * euroUsd;

        // пошлина
        const feeUsd = (price + exciseSumUsd) * 0.1;
        // ндс
        const vatUsd = (price + exciseSumUsd + feeUsd) * 0.2;

        const sumUsd = exciseSumUsd + feeUsd + vatUsd;

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
                console.log('ship: ', shipCost);
            }
        });
        this.calculated.ship = `€${Math.round(shipCost*euroUsd * 100) / 100} ($${shipCost})`;
        // full sum
        let fullSum = sumUsd+shipCost+price;
        console.log('fullSum ', fullSum);
        console.log('customs sum: ',sumUsd,' ship: ',shipCost,' price: ',price);
        this.calculated.fullSum = `€${Math.round(fullSum*euroUsd * 100) / 100} ($${fullSum})`
    }
    // calculateShipping() {
    //     let state = (this.carLocation)?this.carLocation:this.data.location.state;
    //     let euroUsd = parseFloat(this.euro2usd);
    //     Object.keys(this.shippingPricesExample).forEach(key => {
    //         if (state === key) {
    //             this.calculated.ship = `€${Math.round(this.shippingPricesExample[key]*euroUsd * 100) / 100} ($${this.shippingPricesExample[key]}`;
    //             return;
    //         }
    //     });
    // }
    // toEur(str: string) {
    //     return (parseInt(str) / parseFloat(this.euro2usd)).toString();
    // }
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
