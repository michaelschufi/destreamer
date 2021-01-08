import { spawn, spawnSync } from 'child_process';
import { readFileSync } from 'fs';

const spawnDestreamer = (url, sync = false) => {
  const args = [
    'node',
    [
      '--max-http-header-size',
      '32768',
      'build/src/destreamer.js',
      '-u',
      'youremail@example.com',
      '-i',
      url,
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
    const ret = spawnDestreamer(videos[0], true);
    if (ret.status != 0) {
      process.exit(1);
    }
    await Promise.all(videos.map((url) => {
      const childProcess = spawnDestreamer(url);

      return new Promise(function (resolve, reject) {
        childProcess.addListener('error', reject);
        childProcess.addListener('exit', resolve);
      });
    }));
  }
})();
