import { Timestamp } from 'firebase/firestore';

export default interface PlantWatering {
  id: string;
  wateringDate: Timestamp;
}
