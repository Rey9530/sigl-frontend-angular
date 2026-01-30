/// <reference types="@angular/localize" />

import { bootstrapApplication } from "@angular/platform-browser";
import { Chart, registerables } from 'chart.js';

import { App } from "./app/app";
import { appConfig } from "./app/app.config";

// Register Chart.js components globally
Chart.register(...registerables);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
