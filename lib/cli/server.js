import nopt from 'nopt';
import Server from '../server.js';

export default function serverCommand (app, args) {
  const parsed = nopt({
    cluster: Boolean,
    listen: [String, Array],
    workers: Number
  }, {c: '--cluster', l: '--listen', w: '--workers'}, args, 1);

  const server = new Server(app, {cluster: parsed.cluster, listen: parsed.listen, workers: parsed.workers});
  server.start();
}

serverCommand.description = 'Start application with HTTP server';
serverCommand.usage = `Usage: APPLICATION server [OPTIONS]

  ./myapp.js server
  ./myapp.js server --cluster
  ./myapp.js server -l http://*:8080

Options:
  -c, --cluster             Run in cluster mode with multiple processes
  -h, --help                Show this summary of available options
  -l, --listen <location>   One or more locations you want to listen on,
                            defaults to "http://*:3000"
  -w, --workers <num>       Number of workers to spawn in cluster mode,
                            defaults to the number of available CPUs
`;
