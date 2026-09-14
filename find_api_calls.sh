#!/bin/bash
echo "| Frontend File | Method | URL | Notes |"
echo "|---|---|---|---|"
grep -rn "apiRequest(" frontend/src | awk -F: '{print "| " $1 " | " $2 " | " $3 " | |"}'
grep -rn "fetch(" frontend/src | awk -F: '{print "| " $1 " | " $2 " | " $3 " | |"}'
