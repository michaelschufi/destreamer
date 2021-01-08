# Destreamer with parallelization script
Just a fork of [snobu/destreamer](https://github.com/snobu/destreamer) with a script to make multiple downloads at once.

### Usage
First add a textfile with video URLs in it:

Call it e.g. `videos.txt`
```txt
https://web.microsoftstream.com/video/xxxxxxxx-aaaa-xxxx-xxxx-xxxxxxxxxxxx
https://web.microsoftstream.com/video/xxxxxxxx-bbbb-xxxx-xxxx-xxxxxxxxxxxx
```

then run the js script:

```shell
node --experimental-modules ./_download_parallel.mjs ./videos.txt
```

The video files will always be stored in the same directory as the `video.txt` file.
