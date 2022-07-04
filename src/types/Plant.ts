import { Timestamp } from 'firebase/firestore';
import type PlantWaterings from './PlantWaterings';

export default interface Plant {
  id: string;
  name: string;
  wateringInterval: number;
  lastWateringDate: Timestamp;
  waterings: PlantWaterings[];
  imgSrc?: string;
}
