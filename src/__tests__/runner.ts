/**
 * Created by lifeg on 08/04/2017.
 */
import * as path from "path";

let Jasmine = require('jasmine');
import {SpecReporter} from 'jasmine-spec-reporter';
import glob = require('glob');
let jrunner = new Jasmine();

jrunner.specDir = "dist/__tests__";
jrunner.specFiles = glob.sync( __dirname + "/specs/**/*[sS]pec.js");
jrunner.helpers = glob.sync(__dirname + "/helpers/**/*.js");
jrunner.stopSpecOnExpectationFailure = false;
jrunner.random = false;
jrunner.env.clearReporters();                       // jasmine >= 2.5.2, remove default reporter logs
jrunner.addReporter(new SpecReporter());            // add jasmine-spec-reporter
jrunner.loadConfigFile();                           // load jasmine.json configuration
jrunner.execute();