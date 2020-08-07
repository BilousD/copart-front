import {Component, Input, OnInit} from '@angular/core';
import {ParserService} from "./parser.service";
import {LotType} from "./types";
import {formatDate} from "@angular/common";

@Component({
    selector: 'app-lot-info',
    templateUrl: './lot-info.component.html',
    styleUrls: ['./lot-info.component.css']
})
export class LotInfoComponent {

    @Input() data: LotType;

    constructor() { }
}
