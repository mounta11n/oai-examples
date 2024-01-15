#!/usr/bin/env bash

ffmpeg -i input.m4a -f segment -segment_time 600 -c copy -reset_timestamps 1 output_%03d.m4a
