export interface LotType {
    marka: string,
    model: string,
    year: string,
    VIN: string,
    retailValue: string,
    engine: string,
    cylinders: string,
    fuel: string,
    drive: string,
    transmission: string,
    bodyStyle: string,
    color: string,
    photo: string,
    damage: string,
    secondaryDamage: string,
    fullName: string,
    lot: {
        buyerNumber: string,
        buyTodayBid: string,
        currentBid: string,
        sealedBid: string,
        hasBid: string,
        lotSold: string,
        bidStatus: string
    },
    lastUpdated: number,
    auctionDate: number,
    location: {
        short: string,
        zip: string,
        long: string,
        lat: string,
        city: string,
        state: string,
        country: string
    }
}
