import Plant from '../types/Plant';

export const calculateNextWatering = (plant: Plant) => {
  if (!plant.lastWateringDate) return;
  const previousWatering = new Date(plant.lastWateringDate.toDate());
  const nextWatering = new Date(previousWatering.valueOf());
  nextWatering.setDate(previousWatering.getDate() + plant.wateringInterval);
  return nextWatering;
};

export const getDifferenceInDays = (date1: Date | undefined) => {
  if (!date1) return undefined;

  const date1Midnight = new Date(date1.toDateString());
  const diffTime = date1Midnight.valueOf() - new Date().valueOf();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDifferenceInDaysText = (date: Date | undefined) => {
  const differenceInDays = getDifferenceInDays(date);
  if (differenceInDays == null) return '-';
  if (differenceInDays === 0) return 'Today!';
  if (differenceInDays < 0) {
    if (differenceInDays === -1) return `${Math.abs(differenceInDays)} day ago`;
    return `${Math.abs(differenceInDays)} days ago`;
  }
  if (differenceInDays > 0) {
    if (differenceInDays === 1) return `In ${differenceInDays} day`;
    return `In ${differenceInDays} days`;
  }
};
