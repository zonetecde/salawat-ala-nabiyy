import { onMount } from 'svelte';
import { writable } from 'svelte/store';

export const userId = writable('');
