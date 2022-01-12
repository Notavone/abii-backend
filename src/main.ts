import express from 'express';
import {config} from 'dotenv';
import * as path from "path";
import passportConfig from "./passportConfig";

config({path: path.resolve(__dirname, "../.env")});
passportConfig();

const app = express();
