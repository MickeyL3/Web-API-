import { create } from 'zustand';
interface Game {
    gameId: number;
    title: string;
    creationDate: string;
    genreId: number;
    creatorId: number;
    creatorFirstName: string;
    creatorLastName: string;
    price: number;
    rating: number;
    platformIds: number[];

}

interface GameState {
    games: Game[];
    setGames: (games: Array<Game>) => void;
    gameImages: { [gameId: number]: string }; // key: gameId, value: image URL
    setImage: (gameId: number, imageUrl: string) => void;

}


const getLocalStorage = (key: string): Array<Game> =>
    JSON.parse(window.localStorage.getItem(key) as string) || [];

const setLocalStorage = (key: string, value: Array<Game>) =>
    window.localStorage.setItem(key, JSON.stringify(value));

const useStore = create<GameState>((set) => ({
    games: getLocalStorage('games'),
    gameImages: {}, // or load from localStorage if you plan to persist
    setGames: (games) => {
        setLocalStorage('games', games);
        return set(() => ({ games }));
    },
    setImage: (gameId, imageUrl) =>
        set((state) => ({
            gameImages: { ...state.gameImages, [gameId]: imageUrl }
        })),

}));

export const useGameStore = useStore;
