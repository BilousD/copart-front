import {Component, Input, OnInit} from '@angular/core';
import {LotType} from "./types";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";
import {ParserService} from "./parser.service";

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

    fuelToExcise: {} = {};
    shippingPrices: {} = {};
    auctionFees = [];

    bigScreen = false;

    myControl = new FormControl();
    options: string[] = Object.keys(this.shippingPrices);
    filteredOptions: Observable<string[]>;

    constructor(public breakpointObserver: BreakpointObserver, public parserService: ParserService) { }

    ngOnInit() {
        this.parserService.requestCalc().subscribe(res => {
            this.auctionFees = res.data.auction;
            this.shippingPrices = res.data.shipping;
            this.fuelToExcise = res.data.excise;
            this.options = Object.keys(this.shippingPrices);
        });
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
        let exciseRateEur = this.fuelToExcise['DEFAULT'];
        let volume = parseFloat(this.data.engine.split('L')[0]);
        let year = parseInt(this.data.year);
        let price = parseInt((this.carPrice)?this.carPrice:this.data.lot.currentBid);
        let euroUsd = parseFloat(this.euro2usd);
        let aucFee = this.auctionFees[this.auctionFees.length-1][1];

        Object.keys(this.fuelToExcise).forEach(key => {
            if (key !== 'DEFAULT' && this.data.fuel === key) {
                let array = this.fuelToExcise[key];
                exciseRateEur = array[array.length-1][1];
                for (let arr of array) {
                    if (volume < arr[0]) {
                        exciseRateEur = arr[1];
                    }
                }
            }
        });
        for (let array of this.auctionFees) {
            if (price < array[0]) {
                aucFee = array[1];
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
        Object.keys(this.shippingPrices).forEach(key => {
            if (state === key) {
                shipCost = this.shippingPrices[key];
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
