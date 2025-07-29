type Game = {
    /**
     * Game ID as defined by the database
     */
    gameId: number;

    /**
     * Game title
     */
    title: string;

    /**
     * ID of the genre this game belongs to
     */
    genreId: number;

    /**
     * Game creation date (ISO string)
     */
    creationDate: string;

    /**
     * ID of the user who created the game
     */
    creatorId: number;

    /**
     * Price of the game in cents (or lowest currency unit)
     */
    price: number;

    creatorFirstName: string;

    creatorLastName: string;

    rating: number;

    /**
     * IDs of platforms this game is available on
     */
    platformIds: number[];
};

type Genre = {
    genreId: number,
    name: string
}

type Platform = {
    platformId: number,
    name: string
}

type Review = {
    reviewerId: number,
    rating: number,
    review: string,
    reviewerFirstName: string,
    reviewerLastName: string,
    timestamp: string
}
type GameFull = game & {
    description: string,
    numberOfOwners: number,
    numberOfWishlists: number
}

type GameSearchQuery = {
    q?: string,
    creatorId?: number,
    reviewerId?: number,
    genreIds?: number[],
    platformIds?: number[],
    price?: number,
    sortBy?: string,
    startIndex: number,
    count?: number
    ownedByMe: boolean,
    wishlistedByMe: boolean,
    userId?: number
}
