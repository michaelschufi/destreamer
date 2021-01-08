import { spawn, spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

const spawnDestreamer = (url, outputDir, sync = false) => {
  const args = [
    'node',
    [
      '--max-http-header-size',
      '32768',
      'build/src/destreamer.js',
      '-k',
      '-u',
      'youremail@example.com',
      '-i',
      url,
      '-o',
      outputDir,
      '-x',
      sync ? '-s' : '',
    ],
    {
      stdio: 'inherit',
    },
  ];

  return sync ? spawnSync(...args) : spawn(...args);
};

(async () => {
  const videos = readFileSync(process.argv[2]).toString().split('\n');

  const outputDir = path.parse(process.argv[2]).dir

  const videoCollections = videos.reduce((acc, current, index) => {
    if (index % 10 === 0) {
      acc.push([current]);
    }
    else {
      acc[acc.length - 1].push(current);
    }

    return acc;
  }, []);
  console.log(videoCollections);

  for (const videos of videoCollections) {
    const ret = spawnDestreamer(videos[0], '.', true);
    if (ret.status != 0) {
      process.exit(1);
    }
    await Promise.all(videos.map((url) => {
      const childProcess = spawnDestreamer(url, outputDir);

      return new Promise(function (resolve, reject) {
        childProcess.addListener('error', reject);
        childProcess.addListener('exit', resolve);
      });
    }));
  }
})();
