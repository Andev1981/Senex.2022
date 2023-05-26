import './bootstrap';
import 'flowbite';
import 'flowbite-datepicker';
import Datepicker from 'flowbite-datepicker/Datepicker';
import { createPopper } from "@popperjs/core";

import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.start();

window.createPopper = createPopper;