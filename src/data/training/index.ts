import type { TrainingSpec } from '../../training/types';
import { coffeeStation } from './coffee-station';
import { frontDesk } from './front-desk';
import { platedDinner } from './plated-dinner';
import { roundTable } from './round-table';

/** Built-in modules. A plate, table, or station file — or a workstation film via practiceFromVideo. */
export const TRAINING_SPECS: TrainingSpec[] = [platedDinner, roundTable, coffeeStation, frontDesk];

export const specById = (id: string) => TRAINING_SPECS.find((s) => s.id === id);
