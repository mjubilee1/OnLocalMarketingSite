import type { TrainingSpec } from '../../training/types';
import { platedDinner } from './plated-dinner';
import { roundTable } from './round-table';
import { coffeeStation } from './coffee-station';

/** Built-in modules. Add a department by creating a spec file and appending it here. */
export const TRAINING_SPECS: TrainingSpec[] = [platedDinner, roundTable, coffeeStation];

export const specById = (id: string) => TRAINING_SPECS.find((s) => s.id === id);
