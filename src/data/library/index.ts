import { GLOBAL_COURSES } from './global';
import { US_COURSES } from './us';
import { HOUSE_COURSES, UK_COURSES } from './uk';

export { LIBRARY_DOCS, BUNDLES } from './docs';

export const LIBRARY_COURSES = [...GLOBAL_COURSES, ...US_COURSES, ...UK_COURSES, ...HOUSE_COURSES];
