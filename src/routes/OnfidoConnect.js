import { Onfido, Region } from "@onfido/api";
import apiToken  from './config.js';

const onfido = new Onfido({
    apiToken,
    region: Region.EU,
  });

export default onfido;