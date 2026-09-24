import { GLOBAL_COURSES } from './global';
import { US_COURSES } from './us';
import { HOUSE_COURSES } from './house';

export { LIBRARY_DOCS, BUNDLES } from './docs';

export const LIBRARY_COURSES = [...US_COURSES, ...GLOBAL_COURSES, ...HOUSE_COURSES];
